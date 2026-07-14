const Service = require('../models/Service');

// @desc    Get all active services
// @route   GET /api/services
// @access  Public
exports.getServices = async (req, res, next) => {
  try {
    // If services table is empty, auto-seed defaults for testing/first run
    const count = await Service.countDocuments();
    if (count === 0) {
      await seedDefaultServices();
    }

    const services = await Service.find({ isActive: true });
    res.status(200).json({
      success: true,
      count: services.length,
      data: services
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new service
// @route   POST /api/services
// @access  Private/Admin
exports.createService = async (req, res, next) => {
  try {
    const service = await Service.create(req.body);
    res.status(201).json({
      success: true,
      data: service
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update an existing service
// @route   PUT /api/services/:id
// @access  Private/Admin
exports.updateService = async (req, res, next) => {
  try {
    let service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({
        success: false,
        error: 'Service not found'
      });
    }

    service = await Service.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: service
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a service
// @route   DELETE /api/services/:id
// @access  Private/Admin
exports.deleteService = async (req, res, next) => {
  try {
    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({
        success: false,
        error: 'Service not found'
      });
    }

    await service.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Service removed successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Helper function to seed default services
const seedDefaultServices = async () => {
  const defaults = [
    {
      name: "Apple iPhone iCloud Unlock - Clean (All Models)",
      brand: "Apple",
      serviceType: "iCloud Unlock",
      price: 89.99,
      estTime: "1-3 Days",
      description: "Unlocks clean, non-lost/non-stolen iPhone models from iCloud lock. 100% success rate for clean devices."
    },
    {
      name: "T-Mobile USA - iPhone Network Unlock (6S to 15 Pro Max)",
      brand: "Apple",
      serviceType: "Network Unlock",
      price: 49.99,
      estTime: "2-5 Days",
      description: "Permanently unlock your T-Mobile iPhone to use on any carrier globally."
    },
    {
      name: "Samsung Worldwide Network Unlock (All Models)",
      brand: "Samsung",
      serviceType: "Network Unlock",
      price: 24.99,
      estTime: "12-24 Hours",
      description: "Unlock codes for Samsung Galaxy S, Note, and Z fold series on any network worldwide."
    },
    {
      name: "Google Pixel & Motorola FRP Lock Bypass",
      brand: "Google",
      serviceType: "FRP Unlock",
      price: 19.99,
      estTime: "1-6 Hours",
      description: "Bypass Google Factory Reset Protection (FRP) on all Android devices remotely."
    },
    {
      name: "Universal IMEI Blacklist / Status Check",
      brand: "Apple",
      serviceType: "Blacklist Check",
      price: 2.99,
      estTime: "Instant",
      description: "Checks if a device is reported lost, stolen, or blacklisted on national carrier registries."
    }
  ];

  await Service.insertMany(defaults);
  console.log("Database automatically seeded with default IMEI services.");
};
