const Device = require('../models/Device');
const Restriction = require('../models/Restriction');

const setupSocketHandlers = (io) => {
  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Device registration via WebSocket
    socket.on('register-device', async (data) => {
      try {
        const device = await Device.findOne({ device_id: data.device_id });
        if (device) {
          socket.join(`device:${device._id}`);
          socket.join(`user:${device.user_id}`);
          console.log(`Device ${device._id} registered to socket`);
        }
      } catch (error) {
        console.error('Error registering device:', error);
      }
    });

    // Parent joins monitoring room
    socket.on('join-parent-room', (data) => {
      const { parent_id } = data;
      socket.join(`parent:${parent_id}`);
      console.log(`Parent ${parent_id} joined monitoring room`);
    });

    // Child activity updates
    socket.on('activity-update', async (data) => {
      try {
        const { device_id, child_id, ...activityData } = data;

        // Broadcast to parents
        const restrictions = await Restriction.findOne({ child_id, device_id });
        if (restrictions) {
          io.to(`parent:${restrictions.parent_id}`).emit('activity-received', {
            child_id,
            device_id,
            ...activityData,
            timestamp: new Date(),
          });
        }
      } catch (error) {
        console.error('Error broadcasting activity:', error);
      }
    });

    // Block website request
    socket.on('block-website', (data) => {
      const { target_device_id, website } = data;
      io.to(`device:${target_device_id}`).emit('website-blocked', { website });
    });

    // Lock screen request
    socket.on('lock-screen', (data) => {
      const { target_device_id, reason } = data;
      io.to(`device:${target_device_id}`).emit('screen-lock', { reason });
    });

    // Unlock screen request
    socket.on('unlock-screen', (data) => {
      const { target_device_id } = data;
      io.to(`device:${target_device_id}`).emit('screen-unlock', {});
    });

    // Check restrictions before accessing website
    socket.on('check-website', async (data) => {
      try {
        const { device_id, url, child_id } = data;
        const restrictions = await Restriction.findOne({ device_id, child_id });

        if (restrictions) {
          const isBlocked =
            restrictions.blocked_websites.some((site) =>
              url.includes(site)
            ) ||
            (!restrictions.allowed_websites.length && restrictions.blocked_websites.length > 0);

          socket.emit('website-check-result', {
            url,
            blocked: isBlocked,
            timestampcheck: new Date(),
          });
        }
      } catch (error) {
        console.error('Error checking website:', error);
      }
    });

    // Disconnect
    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });
};

module.exports = { setupSocketHandlers };
