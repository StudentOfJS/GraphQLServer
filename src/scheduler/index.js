// scheduler
const cron = require('node-cron');

// creates schedule
// see http://merencia.com/node-cron/ for sheduling options
const scheduler = (fn, schedule = '* 5 * * * 1-5') => {
  console.log("cron running")
  return cron.schedule(schedule, fn, false)
}

// const scheduleTest = () => cron.schedule('* * * * * 1', () => console.log('cron working'), false);

module.exports = scheduler;