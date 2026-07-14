const Order = require('../models/Order');
const Service = require('../models/Service');
const sendEmail = require('../utils/sendEmail');

// Helper function to generate a unique short Order ID
const generateUniqueOrderId = async () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let isUnique = false;
  let orderId = '';

  while (!isUnique) {
    orderId = 'IMEI-';
    for (let i = 0; i < 6; i++) {
      orderId += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    // Check collision in Database
    const existingOrder = await Order.findOne({ orderId });
    if (!existingOrder) {
      isUnique = true;
    }
  }

  return orderId;
};

// Helper function to send order confirmation email
const sendConfirmationEmail = async (order) => {
  const subject = `Order Confirmation: ${order.orderId} - Pending Manual Review`;
  
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
      <h2 style="color: #1f2937; margin-bottom: 5px;">IMEI Unlock Service Portal</h2>
      <p style="color: #6b7280; font-size: 14px; margin-top: 0;">Order Submitted Successfully</p>
      <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
      
      <p style="font-size: 16px; color: #374151;">Hello,</p>
      <p style="font-size: 16px; color: #374151;">Thank you for your order! We have received your IMEI unlock submission. Our administrator is currently reviewing it manually.</p>
      
      <div style="background-color: #f9fafb; padding: 15px; border-radius: 6px; margin: 20px 0; border: 1px solid #f3f4f6;">
        <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
          <tr>
            <td style="padding: 4px 0; color: #6b7280; width: 120px;">Order ID:</td>
            <td style="padding: 4px 0; color: #111827; font-weight: bold;">${order.orderId}</td>
          </tr>
          <tr>
            <td style="padding: 4px 0; color: #6b7280;">Device:</td>
            <td style="padding: 4px 0; color: #111827;">${order.brand} ${order.model}</td>
          </tr>
          <tr>
            <td style="padding: 4px 0; color: #6b7280;">IMEI:</td>
            <td style="padding: 4px 0; color: #111827; font-family: monospace;">${order.imei}</td>
          </tr>
          <tr>
            <td style="padding: 4px 0; color: #6b7280;">Service:</td>
            <td style="padding: 4px 0; color: #111827;">${order.serviceNameSnapshot}</td>
          </tr>
          <tr>
            <td style="padding: 4px 0; color: #6b7280;">Price Paid:</td>
            <td style="padding: 4px 0; color: #111827; font-weight: bold;">$${order.priceSnapshot.toFixed(2)}</td>
          </tr>
        </table>
      </div>

      <p style="font-size: 15px; color: #374151;">
        You can check the progress of your unlock request at any time by visiting this tracking page:
      </p>
      <div style="text-align: center; margin: 25px 0;">
        <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/track/${order.orderId}" 
           style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
          Track Order Status
        </a>
      </div>

      <p style="font-size: 12px; color: #9ca3af; margin-top: 40px; text-align: center; line-height: 1.5;">
        This is an automated notification from the IMEI Unlock Service reseller portal.<br/>
        Once our admin manually completes the unlock, you will receive another email containing instructions or codes.
      </p>
    </div>
  `;

  const text = `
    IMEI Unlock Service Portal
    Order Confirmation
    
    Hello,
    
    We have received your IMEI unlock submission.
    
    Order Details:
    - Order ID: ${order.orderId}
    - Device: ${order.brand} ${order.model}
    - IMEI: ${order.imei}
    - Service: ${order.serviceNameSnapshot}
    - Cost: $${order.priceSnapshot.toFixed(2)}
    
    Track your live order here: ${process.env.FRONTEND_URL || 'http://localhost:5173'}/track/${order.orderId}
    
    Thank you,
    IMEI Unlock Service Portal
  `;

  try {
    await sendEmail({
      to: order.customerEmail,
      subject,
      text,
      html
    });
  } catch (err) {
    console.error(`Confirmation email dispatch error: ${err.message}`);
  }
};

// @desc    Create a new IMEI unlock order
// @route   POST /api/orders
// @access  Public (Guest or logged in user)
exports.createOrder = async (req, res, next) => {
  try {
    const { imei, brand, model, serviceId, customerEmail, customerPhone } = req.body;

    // Validate inputs
    if (!imei || !brand || !model || !serviceId || !customerEmail) {
      return res.status(400).json({
        success: false,
        error: 'Please fill in all required order parameters (IMEI, Brand, Model, Service, and Contact Email)'
      });
    }

    // IMEI 15-digit check
    if (!/^\d{15}$/.test(imei)) {
      return res.status(400).json({
        success: false,
        error: 'IMEI number must be exactly 15 digits'
      });
    }

    // Find the requested unlock service
    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({
        success: false,
        error: 'The selected unlock service is no longer active or was not found'
      });
    }

    // Generate short copyable Order ID
    const orderId = await generateUniqueOrderId();

    // Create the order
    const order = await Order.create({
      orderId,
      user: req.user ? req.user.id : null, // Linked if authenticated via optionalProtect
      imei,
      brand,
      model,
      service: serviceId,
      serviceNameSnapshot: service.name,
      priceSnapshot: service.price,
      customerEmail,
      customerPhone: customerPhone || '',
      status: 'Pending'
    });

    // Send confirmation email
    await sendConfirmationEmail(order);

    res.status(201).json({
      success: true,
      data: order
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all orders for the logged-in user
// @route   GET /api/orders
// @access  Private
exports.getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .populate('service', 'name estTime price')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Track order by orderId (Public)
// @route   GET /api/orders/track/:orderId
// @access  Public
exports.trackOrder = async (req, res, next) => {
  try {
    const order = await Order.findOne({ orderId: req.params.orderId.toUpperCase() })
      .populate('service', 'name estTime price');

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found with that ID'
      });
    }

    // Prepare safe public response data
    const publicOrderInfo = {
      orderId: order.orderId,
      brand: order.brand,
      model: order.model,
      serviceName: order.serviceNameSnapshot,
      status: order.status,
      notes: order.notes,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      // Mask email slightly for privacy: j***e@example.com
      maskedEmail: maskEmail(order.customerEmail)
    };

    res.status(200).json({
      success: true,
      data: publicOrderInfo
    });
  } catch (error) {
    next(error);
  }
};

// Helper function to obscure emails
const maskEmail = (email) => {
  if (!email) return '';
  const parts = email.split('@');
  if (parts.length !== 2) return email;
  const name = parts[0];
  const domain = parts[1];
  if (name.length <= 2) {
    return `${name[0]}***@${domain}`;
  }
  return `${name[0]}${'*'.repeat(name.length - 2)}${name[name.length - 1]}@${domain}`;
};
