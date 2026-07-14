const Order = require('../models/Order');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');

// Helper function to send status change emails
const sendStatusEmail = async (order) => {
  const subject = `Order Status Update: ${order.orderId} is now ${order.status}`;
  
  let statusColor = '#3b82f6'; // Blue
  if (order.status === 'Completed') statusColor = '#10b981'; // Green
  if (order.status === 'Failed') statusColor = '#f43f5e'; // Red
  if (order.status === 'Pending') statusColor = '#f59e0b'; // Amber

  const notesHtml = order.notes 
    ? `<div style="margin-top: 15px; padding: 12px; background-color: #f3f4f6; border-left: 4px solid #8b5cf6; font-family: monospace; font-size: 14px; color: #1f2937;">
        <strong>Admin Notes / Unlock Codes:</strong><br/>
        ${order.notes.replace(/\n/g, '<br/>')}
       </div>`
    : '';

  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
      <h2 style="color: #1f2937; margin-bottom: 5px;">IMEI Unlock Service Portal</h2>
      <p style="color: #6b7280; font-size: 14px; margin-top: 0;">Order Status Update Notification</p>
      <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
      
      <p style="font-size: 16px; color: #374151;">Hello,</p>
      <p style="font-size: 16px; color: #374151;">The status of your IMEI unlock order has been updated to <strong style="color: ${statusColor}; text-transform: uppercase;">${order.status}</strong>.</p>
      
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
        </table>
        ${notesHtml}
      </div>

      <p style="font-size: 15px; color: #374151;">
        You can track the live status of your order at any time using the link below:
      </p>
      <div style="text-align: center; margin: 25px 0;">
        <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/track/${order.orderId}" 
           style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
          Track Live Order
        </a>
      </div>

      <p style="font-size: 12px; color: #9ca3af; margin-top: 40px; text-align: center; line-height: 1.5;">
        This is an automated notification from the IMEI Unlock Service reseller portal.<br/>
        Please do not reply directly to this email. For support, contact us at support@imeiunlock.com.
      </p>
    </div>
  `;

  const text = `
    IMEI Unlock Service Portal
    Order Status Update
    
    Hello,
    
    The status of your IMEI unlock order has been updated to: ${order.status.toUpperCase()}
    
    Order Details:
    - Order ID: ${order.orderId}
    - Device: ${order.brand} ${order.model}
    - IMEI: ${order.imei}
    - Service: ${order.serviceNameSnapshot}
    ${order.notes ? `\nAdmin Notes / Codes:\n${order.notes}` : ''}
    
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
    console.error(`Email dispatch error: ${err.message}`);
  }
};

// @desc    Get dashboard statistics for admin
// @route   GET /api/admin/stats
// @access  Private/Admin
exports.getDashboardStats = async (req, res, next) => {
  try {
    const totalOrders = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({ status: 'Pending' });

    // Aggregate total revenue from completed orders
    const revenueResult = await Order.aggregate([
      { $match: { status: 'Completed' } },
      { $group: { _id: null, total: { $sum: '$priceSnapshot' } } }
    ]);
    const revenue = revenueResult[0]?.total || 0;

    // Completed today (within past 24 hours)
    const past24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const completedToday = await Order.countDocuments({
      status: 'Completed',
      updatedAt: { $gte: past24Hours }
    });

    res.status(200).json({
      success: true,
      data: {
        totalOrders,
        pendingOrders,
        revenue,
        completedToday
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all orders for admin review
// @route   GET /api/admin/orders
// @access  Private/Admin
exports.getAdminOrders = async (req, res, next) => {
  try {
    const orders = await Order.find()
      .populate('user', 'name email')
      .populate('service', 'name price')
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

// @desc    Update order status and add admin notes
// @route   PUT /api/admin/orders/:id
// @access  Private/Admin
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { status, notes } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    const statusChanged = status && order.status !== status;

    if (status) order.status = status;
    if (notes !== undefined) order.notes = notes;

    await order.save();

    // Trigger email notification if the status changes
    if (statusChanged) {
      await sendStatusEmail(order);
    }

    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all registered users list
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getRegisteredUsers = async (req, res, next) => {
  try {
    const users = await User.find({ role: 'user' }).select('-password').sort('-createdAt');

    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    next(error);
  }
};
