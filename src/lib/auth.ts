import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { customSession } from "better-auth/plugins"; // Adjust the import path if customSession is defined elsewhere
import { eq } from "drizzle-orm";

import { db } from "@/db";
import * as schema from "@/db/schema";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    usePlural: true,
    schema,
  }),
  plugins: [
    customSession(async ({ user, session }) => {
      const clinics = await db.query.usersToClinicsTable.findMany({
        where: eq(schema.usersToClinicsTable.userId, user.id),
        with: {
          clinic: true,
        },
      });

      // TODO: Ao adaptar para o usuário ter múltiplas clínicas, deve-se mudar essa lógica
      const clinic = clinics[0];

      return {
        user: {
          ...user,
          clinic: {
            id: clinic.clinicId,
            name: clinic.clinic.name,
          },
        },
        session,
      };
    }),
  ],
  user: {
    modelName: "usersTable",
  },
  session: {
    modelName: "sessionsTable",
  },
  account: {
    modelName: "accountsTable",
  },
  verification: {
    modelName: "verificationsTable",
  },
  emailAndPassword: {
    enabled: true,
  },
});
