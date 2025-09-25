import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return new Response(
        JSON.stringify({ error: "Name, email, and password are required" }),
        { status: 400 }
      );
    }

    // Step 1: Check if a superadmin already exists
    const existingSuperadmin = await prisma.userRole.findFirst({
      where: {
        role: {
          name: "superadmin",
        },
      },
    });

    if (existingSuperadmin) {
      return new Response(
        JSON.stringify({ error: "Superadmin already exists" }),
        { status: 400 }
      );
    }

    // Step 2: Get the superadmin role
    // Get or create superadmin role automatically
    let superadminRole = await prisma.role.findUnique({
      where: { name: "superadmin" },
    });

    if (!superadminRole) {
      superadminRole = await prisma.role.create({
        data: {
          name: "superadmin",
          description: "Full system access",
        },
      });
    }

    // Step 3: Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Step 4: Create the User
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        isActive: true,
        isVerified: true,
      },
    });

    // Step 5: Create the UserRole (link user with superadmin role)
    await prisma.userRole.create({
      data: {
        userId: user.id,
        roleId: superadminRole.id,
        companyId: null, // global role
      },
    });

    // Step 6: Return response
    return new Response(
      JSON.stringify({
        success: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          isActive: user.isActive,
          isVerified: user.isVerified,
        },
      }),
      { status: 201 }
    );
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
    });
  }
}
