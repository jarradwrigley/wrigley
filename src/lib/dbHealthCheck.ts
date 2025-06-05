// lib/dbHealthCheck.ts

interface HealthCheckResult {
  provider: string;
  status: "healthy" | "error" | "unavailable";
  message: string;
  responseTime?: number;
  error?: string;
}

export class DatabaseHealthChecker {
  static async checkMongoose(): Promise<HealthCheckResult> {
    const startTime = Date.now();

    try {
      const { dbConnect } = await import("@/app/lib/mongoose");
      const User = (await import("@/model/User")).default;

      await dbConnect();

      // Simple query to test connection
      await User.findOne().limit(1);

      const responseTime = Date.now() - startTime;

      return {
        provider: "mongoose",
        status: "healthy",
        message: "MongoDB connection successful",
        responseTime,
      };
    } catch (error) {
      return {
        provider: "mongoose",
        status: "error",
        message: "MongoDB connection failed",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  static async checkPrisma(): Promise<HealthCheckResult> {
    const startTime = Date.now();

    try {
      const { prisma } = await import("@/lib/prisma");

      // Simple query to test connection
      await prisma.$queryRaw`SELECT 1`;

      const responseTime = Date.now() - startTime;

      // Clean up
      await prisma.$disconnect();

      return {
        provider: "prisma",
        status: "healthy",
        message: "Prisma connection successful",
        responseTime,
      };
    } catch (error) {
      return {
        provider: "prisma",
        status: "error",
        message: "Prisma connection failed",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  static async checkCurrentProvider(): Promise<HealthCheckResult> {
    const provider = process.env.DATABASE_PROVIDER?.toLowerCase() || "mongoose";

    switch (provider) {
      case "prisma":
        return await this.checkPrisma();
      case "mongoose":
      default:
        return await this.checkMongoose();
    }
  }

  static async checkAllProviders(): Promise<{
    current: HealthCheckResult;
    mongoose: HealthCheckResult;
    prisma: HealthCheckResult;
    recommendation?: string;
  }> {
    const [current, mongoose, prisma] = await Promise.all([
      this.checkCurrentProvider(),
      this.checkMongoose(),
      this.checkPrisma(),
    ]);

    let recommendation: string | undefined;

    // Provide recommendations based on health status
    if (current.status === "error") {
      if (mongoose.status === "healthy" && prisma.status === "healthy") {
        recommendation =
          mongoose.responseTime! < prisma.responseTime!
            ? "Switch to mongoose (faster response)"
            : "Switch to prisma (faster response)";
      } else if (mongoose.status === "healthy") {
        recommendation = "Switch to mongoose";
      } else if (prisma.status === "healthy") {
        recommendation = "Switch to prisma";
      } else {
        recommendation =
          "Both providers have issues - check database connections";
      }
    }

    return {
      current,
      mongoose,
      prisma,
      recommendation,
    };
  }
}
