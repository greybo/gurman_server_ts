import { OrderService } from './server/ServiceOrderFetch';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function bootstrap() {
    try {
        console.log('Starting the application...');
        
        // Create instance of OrderService
        const orderService = new OrderService();
        
        // Start the service
        await orderService.startService();
        
        console.log('Service started successfully');

        // Prevent the application from exiting
        process.on('SIGINT', () => {
            console.log('Received SIGINT. Graceful shutdown...');
            process.exit(0);
        });

        process.on('uncaughtException', (error) => {
            console.error('Uncaught Exception:', error);
            process.exit(1);
        });

        process.on('unhandledRejection', (reason, promise) => {
            console.error('Unhandled Rejection at:', promise, 'reason:', reason);
            process.exit(1);
        });

    } catch (error) {
        console.error('Failed to start the application:', error);
        process.exit(1);
    }
}

// Start the application
bootstrap();
