import { Elysia, t } from "elysia";
import { AuthService } from "./service";
import { AuthModel } from "./model";
import { isAuthenticated } from "@/server/middlewares/auth";

export const auth = new Elysia({ prefix: "/auth" })
  .post(
    "/sign-up",
    async ({ body }) => {
      return await AuthService.signUp(body);
    },
    {
      body: AuthModel.signUpBody,
      response: {
        200: AuthModel.userResponse,
        400: AuthModel.errorResponse,
      },
      
      detail: {
        description: "Sign up for a new account",
        summary: "Sign up for a new account",
        tags: ["Auth"],
      },
    },
  )
  .post(
    "/sign-in",
    async ({ body, cookie: { session } }) => {
      const response = await AuthService.signIn(body);

      // Set session cookie (7 days expiry)
      session.value = response.token;
      session.path = "/";
      session.maxAge = 7 * 24 * 60 * 60;
      session.httpOnly = true;
      session.sameSite = "lax";

      return response;
    },
    {
      body: AuthModel.signInBody,
      response: {
        200: AuthModel.authResponse,
        400: AuthModel.errorResponse,
      },
      detail: {
        description: "Sign in for a new account",
        summary: "Sign in for a new account",
        tags: ["Auth"],
      },
    },
  )
  .use(isAuthenticated)
  .post(
    "/sign-out",
    async ({ sessionToken, cookie: { session } }) => {
      if (sessionToken) {
        await AuthService.signOut(sessionToken as string);
      }
      session.remove();
      return { message: "Logged out successfully" };
    },
    {
      response: {
        200: t.Object({ message: t.String() }),
      },
      detail: {
        description: "Sign out from the current account",
        summary: "Sign out from the current account",
        tags: ["Auth"],
      },
    },
  )
  .get(
    "/me",
    async ({ user }) => {
      return {
        id: user!.id,
        name: user!.name,
        email: user!.email,
        isEmailVerified: user!.isEmailVerified,
      };
    },
    {
      response: {
        200: AuthModel.userResponse,
      },
      detail: {
        description: "Get current user profile",
        summary: "Get current user profile",
        tags: ["Auth"],
      },
    },
  );
