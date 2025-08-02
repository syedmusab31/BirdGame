const User = require('../models/User');

// Auto collect eggs from dead birds with 20% penalty
const autoCollectEggs = async () => {
  try {
    console.log('Running auto egg collection cron job...');
    
    const users = await User.find({ 'birds.0': { $exists: true } })
      .populate('birds.birdId');

    for (let user of users) {
      let hasChanges = false;
      
      for (let userBird of user.birds) {
        // Check if bird is dead and has uncollected eggs
        if (userBird.daysRemaining <= 0 && userBird.uncollectedEggs > 0) {
          const bird = userBird.birdId;
          const eggsToCollect = Math.floor(userBird.uncollectedEggs * 0.8); // 20% penalty
          
          if (eggsToCollect > 0) {
            user.eggStock[bird.name] = (user.eggStock[bird.name] || 0) + eggsToCollect;
            userBird.uncollectedEggs = 0;
            hasChanges = true;
            
            console.log(`Auto collected ${eggsToCollect} ${bird.name} eggs for user ${user.username} (20% penalty applied)`);
          }
        }
        
        // Update uncollected eggs for living birds
        if (userBird.daysRemaining > 0) {
          const bird = userBird.birdId;
          const now = new Date();
          const timeDiff = now - userBird.lastEggCollection;
          const hoursElapsed = timeDiff / (1000 * 60 * 60);
          
          if (hoursElapsed >= 0.167) { // 10 minutes minimum
            const newEggs = Math.floor(hoursElapsed * bird.eggsPerHour);
            if (newEggs > 0) {
              userBird.uncollectedEggs = (userBird.uncollectedEggs || 0) + newEggs;
              hasChanges = true;
            }
          }
        }
      }
      
      if (hasChanges) {
        await user.save();
      }
    }
    
    console.log('Auto egg collection completed');
  } catch (error) {
    console.error('Error in auto egg collection:', error);
  }
};

// Update bird lifespan daily
const updateBirdLifespan = async () => {
  try {
    console.log('Running bird lifespan update cron job...');
    
    const users = await User.find({ 'birds.0': { $exists: true } });
    
    for (let user of users) {
      let hasChanges = false;
      
      for (let userBird of user.birds) {
        if (userBird.daysRemaining > 0) {
          userBird.daysRemaining -= 1;
          hasChanges = true;
          
          if (userBird.daysRemaining === 0) {
            console.log(`Bird died for user ${user.username}`);
          }
        }
      }
      
      if (hasChanges) {
        await user.save();
      }
    }
    
    console.log('Bird lifespan update completed');
  } catch (error) {
    console.error('Error in bird lifespan update:', error);
  }
};

module.exports = {
  autoCollectEggs,
  updateBirdLifespan
};