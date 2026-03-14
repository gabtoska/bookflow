import "next-auth";

declare module "next-auth" {
  interface User {
    businessId?: string;
    businessName?: string;
    businessSlug?: string;
  }

  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      businessId: string;
      businessName: string;
      businessSlug: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    businessId: string;
    businessName: string;
    businessSlug: string;
  }
}
