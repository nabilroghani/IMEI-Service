const User = require('../models/User');
const Service = require('../models/Service');

const seedData = async () => {
  try {
    const adminEmail = 'admin@imeiportal.com';
    let admin = await User.findOne({ email: adminEmail });
    
    if (!admin) {
      // Create fresh admin
      await User.create({
        name: 'System Admin',
        email: adminEmail,
        password: 'adminpassword123', // Will be hashed automatically by User pre-save hook
        role: 'admin'
      });
      console.log(`[SEED] Default admin created: ${adminEmail} / adminpassword123`);
    } else {
      // Self-healing: Force role to admin and overwrite password to adminpassword123
      admin.role = 'admin';
      admin.password = 'adminpassword123'; // Will trigger pre-save hashing
      await admin.save();
      console.log(`[SEED] Admin account verified & password reset to: adminpassword123`);
    }

    // Seed default services if catalogue is empty
    const serviceCount = await Service.countDocuments();
    if (serviceCount === 0) {
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
      console.log("[SEED] Default services seeded successfully.");
    }
  } catch (err) {
    console.error(`[SEED] Seeding error: ${err.message}`);
  }
};

module.exports = seedData;
