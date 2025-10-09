// Cron Scheduler for Automated Daily Payments
// Runs automated payments at 23:00 hrs daily for all riders with balances

import { processAutomatedPayment, cleanupOldRecords } from "./paymentScheduler";
import { logRiderActivity } from "../utils/riderActivity";

// Simple cron implementation (in production, use node-cron or similar)
class CronScheduler {
  private intervals: Map<string, NodeJS.Timeout> = new Map();
  private isRunning: boolean = false;

  // Start the scheduler
  start() {
    if (this.isRunning) {
      console.log('📅 Cron Scheduler already running');
      return;
    }

    this.isRunning = true;
    console.log('🚀 Starting Cron Scheduler for automated payments...');

    // Check every minute for 23:00
    const dailyPaymentCheck = setInterval(() => {
      this.checkAndRunDailyPayments();
    }, 60000); // Check every minute

    // Cleanup old records weekly (every Sunday at 02:00)
    const weeklyCleanup = setInterval(() => {
      this.checkAndRunWeeklyCleanup();
    }, 60000); // Check every minute

    this.intervals.set('dailyPayments', dailyPaymentCheck);
    this.intervals.set('weeklyCleanup', weeklyCleanup);

    console.log('✅ Cron Scheduler started successfully');
  }

  // Stop the scheduler
  stop() {
    if (!this.isRunning) {
      console.log('📅 Cron Scheduler not running');
      return;
    }

    this.intervals.forEach((interval, name) => {
      clearInterval(interval);
      console.log(`🛑 Stopped ${name} scheduler`);
    });

    this.intervals.clear();
    this.isRunning = false;
    console.log('🛑 Cron Scheduler stopped');
  }

  // Check if it's time for daily payments (23:00)
  private async checkAndRunDailyPayments() {
    const now = new Date();
    const hour = now.getHours();
    const minute = now.getMinutes();

    // Run at 23:00 (11 PM)
    if (hour === 23 && minute === 0) {
      console.log('🕚 23:00 - Starting automated daily payments...');
      await this.runDailyAutomatedPayments();
    }
  }

  // Check if it's time for weekly cleanup (Sunday 02:00)
  private checkAndRunWeeklyCleanup() {
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 = Sunday
    const hour = now.getHours();
    const minute = now.getMinutes();

    // Run on Sunday at 02:00
    if (dayOfWeek === 0 && hour === 2 && minute === 0) {
      console.log('🧹 Sunday 02:00 - Running weekly cleanup...');
      cleanupOldRecords(30); // Keep records for 30 days
    }
  }

  // Main function to run daily automated payments
  async runDailyAutomatedPayments() {
    try {
      console.log('💰 Starting daily automated payments process...');
      
      // Import riders data (in production, this would be from database)
      const { getRidersWithBalance } = await import('../utils/ridersData');
      const ridersWithBalance = getRidersWithBalance();

      if (ridersWithBalance.length === 0) {
        console.log('ℹ️ No riders with balance found for automated payments');
        return;
      }

      console.log(`📊 Found ${ridersWithBalance.length} riders with balance for automated payments`);

      const results = {
        total: ridersWithBalance.length,
        successful: 0,
        failed: 0,
        totalAmount: 0
      };

      // Process payments for each rider
      for (const rider of ridersWithBalance) {
        try {
          console.log(`💸 Processing payment for ${rider.fullName} - KES ${rider.currentBalance}`);
          
          const payment = await processAutomatedPayment(rider);
          
          if (payment.status === 'success') {
            results.successful++;
            results.totalAmount += payment.amount;
            
            // Update rider balance to 0 (payment successful)
            await this.updateRiderBalance(rider.id, 0, payment.amount);
            
            console.log(`✅ Payment successful: ${rider.fullName} - KES ${payment.amount}`);
          } else {
            results.failed++;
            console.log(`❌ Payment failed: ${rider.fullName} - ${payment.failureReason}`);
          }
          
          // Wait 2 seconds between payments to avoid overwhelming the system
          await new Promise(resolve => setTimeout(resolve, 2000));
          
        } catch (error) {
          results.failed++;
          console.error(`💥 Error processing payment for ${rider.fullName}:`, error);
        }
      }

      // Log summary
      console.log(`\n📋 DAILY PAYMENT SUMMARY - ${new Date().toLocaleDateString()}`);
      console.log(`🎯 Total Riders: ${results.total}`);
      console.log(`✅ Successful: ${results.successful}`);
      console.log(`❌ Failed: ${results.failed}`);
      console.log(`💰 Total Amount Paid: KES ${results.totalAmount.toLocaleString()}`);
      console.log(`📊 Success Rate: ${((results.successful / results.total) * 100).toFixed(1)}%`);

      // Log system activity
      logRiderActivity({
        riderId: 'SYSTEM',
        riderName: 'System',
        type: 'status_change',
        description: `Daily automated payments completed: ${results.successful}/${results.total} successful (KES ${results.totalAmount.toLocaleString()})`,
        amount: results.totalAmount,
        metadata: {
          totalRiders: results.total,
          successfulPayments: results.successful,
          failedPayments: results.failed,
          successRate: ((results.successful / results.total) * 100).toFixed(1)
        }
      });

    } catch (error) {
      console.error('💥 Error in daily automated payments:', error);
    }
  }

  // Update rider balance after successful payment
  private async updateRiderBalance(riderId: string, newBalance: number, paidAmount: number) {
    try {
      // In production, this would update the database
      // For now, we'll simulate the update
      console.log(`💳 Updated balance for rider ${riderId}: KES ${paidAmount} paid, new balance: KES ${newBalance}`);
      
      // Here you would call the actual rider update function
      // Example: await updateRiderBalanceInDatabase(riderId, newBalance, paidAmount);
      
    } catch (error) {
      console.error(`❌ Error updating rider balance for ${riderId}:`, error);
    }
  }

  // Get scheduler status
  getStatus() {
    return {
      isRunning: this.isRunning,
      activeIntervals: Array.from(this.intervals.keys()),
      nextDailyPayment: this.getNextScheduledTime(23, 0),
      nextWeeklyCleanup: this.getNextWeeklyCleanup()
    };
  }

  // Calculate next scheduled time
  private getNextScheduledTime(hour: number, minute: number): string {
    const now = new Date();
    const next = new Date();
    
    next.setHours(hour, minute, 0, 0);
    
    // If the time has passed today, schedule for tomorrow
    if (next <= now) {
      next.setDate(next.getDate() + 1);
    }
    
    return next.toLocaleString();
  }

  // Calculate next weekly cleanup
  private getNextWeeklyCleanup(): string {
    const now = new Date();
    const nextSunday = new Date();
    
    // Get next Sunday
    const daysUntilSunday = (7 - now.getDay()) % 7;
    nextSunday.setDate(now.getDate() + (daysUntilSunday === 0 ? 7 : daysUntilSunday));
    nextSunday.setHours(2, 0, 0, 0);
    
    return nextSunday.toLocaleString();
  }

  // Manual trigger for testing
  async triggerDailyPayments() {
    console.log('🔧 Manually triggering daily payments...');
    await this.runDailyAutomatedPayments();
  }
}

// Create singleton instance
const cronScheduler = new CronScheduler();

// Export functions
export const startCronScheduler = () => cronScheduler.start();
export const stopCronScheduler = () => cronScheduler.stop();
export const getCronStatus = () => cronScheduler.getStatus();
export const triggerManualPayments = () => cronScheduler.triggerDailyPayments();

// Auto-start when server starts
export const initializeScheduler = () => {
  console.log('🔄 Initializing automated payment scheduler...');
  startCronScheduler();
};
