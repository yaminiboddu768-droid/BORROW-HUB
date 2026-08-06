import { prisma } from '@/lib/prisma';
import { UAParser } from 'ua-parser-js';

export interface AuditLogOptions {
  userId: string;
  role?: string;
  action: string;
  details?: string;
  req?: Request;
}

export async function logActivity(options: AuditLogOptions) {
  try {
    let ipAddress = 'unknown';
    let browser = 'unknown';
    let os = 'unknown';
    let deviceType = 'desktop'; // Default

    if (options.req) {
      // Attempt to extract IP
      const forwarded = options.req.headers.get('x-forwarded-for');
      const realIp = options.req.headers.get('x-real-ip');
      ipAddress = forwarded ? forwarded.split(',')[0] : (realIp || 'unknown');

      // Attempt to extract User Agent
      const userAgent = options.req.headers.get('user-agent');
      if (userAgent) {
        const parser = new UAParser(userAgent);
        const browserObj = parser.getBrowser();
        const osObj = parser.getOS();
        const deviceObj = parser.getDevice();

        browser = `${browserObj.name || 'unknown'} ${browserObj.version || ''}`.trim();
        os = `${osObj.name || 'unknown'} ${osObj.version || ''}`.trim();
        deviceType = deviceObj.type || 'desktop';
      }
    }

    await prisma.activityLog.create({
      data: {
        userId: options.userId,
        role: options.role || 'USER',
        action: options.action,
        details: options.details,
        ipAddress,
        browser,
        os,
        deviceType,
      },
    });
  } catch (error) {
    console.error('Failed to write audit log:', error);
  }
}
