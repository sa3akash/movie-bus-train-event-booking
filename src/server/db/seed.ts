import "dotenv/config";
import { db } from "./index";
import { roles, usersTable, userRoles, cineplexChain, theatersTable, cinemaScreens, seatType, seats } from "./schemas";
import { eq, and, sql } from "drizzle-orm";
import { hashPassword } from "../utils/hash";
import fs from "fs";
import path from "path";

async function main() {
  console.log("Seeding started...");
  
  console.log("Dropping all existing data (TRUNCATE)...");
  const tables = await db.execute(sql`
    SELECT tablename
    FROM pg_tables
    WHERE schemaname = 'public'
  `);
  
  for (const row of tables.rows) {
    if (row.tablename === "drizzle_migrations") continue;
    await db.execute(sql.raw(`TRUNCATE TABLE "${row.tablename}" CASCADE;`));
  }
  console.log("Database cleared successfully.");

  // Seed Roles
  console.log("Seeding roles...");
  const roleNames = ["admin", "staff", "customer"];
  const dbRoles: Record<string, string> = {};

  for (const name of roleNames) {
    let [existingRole] = await db.select().from(roles).where(eq(roles.name, name)).limit(1);
    if (!existingRole) {
      [existingRole] = await db.insert(roles).values({
        name,
        description: `${name} role`,
        isSystem: name === "admin",
      }).returning();
    }
    dbRoles[name] = existingRole.id;
  }

  // Seed Admin User
  console.log("Seeding admin user...");
  const adminEmail = "admin@example.com";
  let [adminUser] = await db.select().from(usersTable).where(eq(usersTable.email, adminEmail)).limit(1);
  if (!adminUser) {
    const passwordHash = await hashPassword("Admin123!");
    [adminUser] = await db.insert(usersTable).values({
      name: "System Admin",
      email: adminEmail,
      isEmailVerified: true,
      passwordHash,
    }).returning();
    
    // Assign admin role
    await db.insert(userRoles).values({
      userId: adminUser.id,
      roleId: dbRoles["admin"],
    });
  }

  // Seed Cineplex Chains
  console.log("Seeding cineplex chains...");
  const chainsData = [
    {
      name: "Star Cineplex",
      slug: "star-cineplex",
      description: "The first state-of-the-art multiplex cinema theater in Bangladesh, providing premium cinematic experiences.",
      logoUrl: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=120&auto=format&fit=crop&q=60",
      website: "https://www.cineplexbd.com",
      contactEmail: "info@cineplexbd.com",
      contactPhone: "+8809612345678",
      totalCinemas: 4,
      isActive: true,
    },
    {
      name: "Blockbuster Cinemas",
      slug: "blockbuster-cinemas",
      description: "Located in Jamuna Future Park, offering premium multiplex movie watching with world-class facilities.",
      logoUrl: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=120&auto=format&fit=crop&q=60",
      website: "https://blockbusterbd.com",
      contactEmail: "support@blockbusterbd.com",
      contactPhone: "+8809623456789",
      totalCinemas: 1,
      isActive: true,
    },
    {
      name: "Lion Cinema",
      slug: "lion-cinema",
      description: "Historic theater modernized into a multi-screen complex in Old Dhaka.",
      logoUrl: "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=120&auto=format&fit=crop&q=60",
      website: "https://lioncinemas.com",
      contactEmail: "lion@cinemas.com",
      contactPhone: "+8801711122233",
      totalCinemas: 1,
      isActive: true,
    },
  ];

  const dbChains: Record<string, string> = {};
  for (const c of chainsData) {
    let [existingChain] = await db.select().from(cineplexChain).where(eq(cineplexChain.slug, c.slug)).limit(1);
    if (!existingChain) {
      [existingChain] = await db.insert(cineplexChain).values({
        name: c.name,
        slug: c.slug,
        description: c.description,
        logoUrl: c.logoUrl,
        website: c.website,
        contactEmail: c.contactEmail,
        contactPhone: c.contactPhone,
        totalCinemas: c.totalCinemas,
        isActive: c.isActive,
      }).returning();
    }
    dbChains[c.slug] = existingChain.id;
  }

  // Seed Theaters
  console.log("Seeding theaters...");
  const theatersData = [
    {
      cineplexChainSlug: "star-cineplex",
      name: "Star Cineplex - Bashundhara City",
      slug: "star-cineplex-bashundhara-city",
      description: "Bashundhara City Multiplex Branch",
      address: "Level 8, Bashundhara City Shopping Mall, Panthapath, Dhaka",
      city: "Dhaka",
      state: "Dhaka Division",
      totalScreens: 6,
      phone: "+88029138260",
      email: "bashundhara@cineplexbd.com",
      isActive: true,
    },
    {
      cineplexChainSlug: "star-cineplex",
      name: "Star Cineplex - Shimanto Square",
      slug: "star-cineplex-shimanto-square",
      description: "Shimanto Square Multiplex Branch",
      address: "Level 4, Shimanto Square Mall, Dhanmondi Road 2, Dhaka",
      city: "Dhaka",
      state: "Dhaka Division",
      totalScreens: 3,
      phone: "+88029631623",
      email: "dhanmondi@cineplexbd.com",
      isActive: true,
    },
    {
      cineplexChainSlug: "star-cineplex",
      name: "Star Cineplex - SKS Tower",
      slug: "star-cineplex-sks-tower",
      description: "SKS Tower Multiplex Branch",
      address: "Level 6, SKS Tower, Mohakhali, Dhaka",
      city: "Dhaka",
      state: "Dhaka Division",
      totalScreens: 3,
      phone: "+88029881666",
      email: "mohakhali@cineplexbd.com",
      isActive: true,
    },
    {
      cineplexChainSlug: "star-cineplex",
      name: "Star Cineplex - Bali Arcade",
      slug: "star-cineplex-bali-arcade",
      description: "Bali Arcade Multiplex Branch",
      address: "Level 5, Bali Arcade Mall, Chawkbazar, Chittagong",
      city: "Chittagong",
      state: "Chittagong Division",
      totalScreens: 3,
      phone: "+88031251322",
      email: "chittagong@cineplexbd.com",
      isActive: true,
    },
    {
      cineplexChainSlug: "blockbuster-cinemas",
      name: "Blockbuster Cinemas - Jamuna Future Park",
      slug: "blockbuster-jamuna-future-park",
      description: "Jamuna Future Park Multiplex Branch",
      address: "Level 5, Jamuna Future Park, Kuril, Pragati Sarani, Dhaka",
      city: "Dhaka",
      state: "Dhaka Division",
      totalScreens: 4,
      phone: "+88096137677",
      email: "jfp@blockbusterbd.com",
      isActive: true,
    },
    {
      cineplexChainSlug: "lion-cinema",
      name: "Lion Cinema Hall - Old Dhaka",
      slug: "lion-cinema-old-dhaka",
      description: "Lion Modernized Theater",
      address: "Lion Shoppers World, Urdu Road, Old Dhaka, Dhaka",
      city: "Dhaka",
      state: "Dhaka Division",
      totalScreens: 0,
      phone: "+8801822334455",
      email: "olddhaka@lioncinemas.com",
      isActive: true,
    },
  ];

  const dbTheaters: Record<string, string> = {};
  for (const t of theatersData) {
    let [existingTheater] = await db.select().from(theatersTable).where(eq(theatersTable.slug, t.slug)).limit(1);
    if (!existingTheater) {
      [existingTheater] = await db.insert(theatersTable).values({
        cineplexChainId: dbChains[t.cineplexChainSlug],
        name: t.name,
        slug: t.slug,
        description: t.description,
        address: t.address,
        city: t.city,
        state: t.state,
        totalScreens: t.totalScreens,
        phone: t.phone,
        email: t.email,
        isActive: t.isActive,
      }).returning();
    }
    dbTheaters[t.slug] = existingTheater.id;
  }

  // Seed Seat Types
  console.log("Seeding seat types...");
  const seatTypeNames = [
    { name: "Standard", capacity: 1, price: 300, color: "#94a3b8" },
    { name: "Premium", capacity: 1, price: 500, color: "#818cf8" },
    { name: "VIP", capacity: 1, price: 800, color: "#fcd34d" },
    { name: "Couple", capacity: 2, price: 1200, color: "#f43f5e" },
  ];

  for (const theaterId of Object.values(dbTheaters)) {
    for (const st of seatTypeNames) {
      const [existingST] = await db
        .select()
        .from(seatType)
        .where(and(eq(seatType.theaterId, theaterId), eq(seatType.name, st.name)))
        .limit(1);
      
      if (!existingST) {
        await db.insert(seatType).values({
          theaterId,
          name: st.name,
          capacity: st.capacity,
          price: st.price,
          color: st.color,
          currency: "BDT",
          priceMultiplier: "1.00",
        });
      }
    }
  }

  // Seed Screens
  console.log("Seeding screens...");
  const screensData = [
    // Bashundhara City screens
    { theaterSlug: "star-cineplex-bashundhara-city", name: "Hall 1 - IMAX", screenType: "IMAX" as const, totalSeats: 350 },
    { theaterSlug: "star-cineplex-bashundhara-city", name: "Hall 2 - VIP", screenType: "VIP" as const, totalSeats: 120 },
    { theaterSlug: "star-cineplex-bashundhara-city", name: "Hall 3 - Dolby", screenType: "DOLBY" as const, totalSeats: 220 },
    { theaterSlug: "star-cineplex-bashundhara-city", name: "Hall 4 - 4DX", screenType: "4DX" as const, totalSeats: 140 },
    { theaterSlug: "star-cineplex-bashundhara-city", name: "Hall 5 - Standard", screenType: "STANDARD" as const, totalSeats: 180 },
    { theaterSlug: "star-cineplex-bashundhara-city", name: "Hall 6 - Standard", screenType: "STANDARD" as const, totalSeats: 180 },
    // Shimanto Square screens
    { theaterSlug: "star-cineplex-shimanto-square", name: "Hall A - Dolby", screenType: "DOLBY" as const, totalSeats: 160 },
    { theaterSlug: "star-cineplex-shimanto-square", name: "Hall B - Standard", screenType: "STANDARD" as const, totalSeats: 150 },
    { theaterSlug: "star-cineplex-shimanto-square", name: "Hall C - VIP", screenType: "VIP" as const, totalSeats: 80 },
    // Jamuna Future Park screens
    { theaterSlug: "blockbuster-jamuna-future-park", name: "Club Royale", screenType: "VIP" as const, totalSeats: 90 },
    { theaterSlug: "blockbuster-jamuna-future-park", name: "Irish Lounge - Dolby", screenType: "DOLBY" as const, totalSeats: 260 },
    { theaterSlug: "blockbuster-jamuna-future-park", name: "Transition - IMAX", screenType: "IMAX" as const, totalSeats: 380 },
    { theaterSlug: "blockbuster-jamuna-future-park", name: "Irish 1 - Standard", screenType: "STANDARD" as const, totalSeats: 200 },
  ];

  for (const s of screensData) {
    const theaterId = dbTheaters[s.theaterSlug];
    if (!theaterId) continue;

    const [existingScreen] = await db
      .select()
      .from(cinemaScreens)
      .where(and(eq(cinemaScreens.theatreId, theaterId), eq(cinemaScreens.name, s.name)))
      .limit(1);

    if (!existingScreen) {
      await db.insert(cinemaScreens).values({
        theatreId: theaterId,
        name: s.name,
        screenType: s.screenType,
        totalSeats: s.totalSeats,
        isActive: true,
      });
    }
  }

  // Seed Seats from data.json
  console.log("Seeding seats from data.json...");
  try {
    const dataPath = path.join(process.cwd(), "data.json");
    if (fs.existsSync(dataPath)) {
      const seatData = JSON.parse(fs.readFileSync(dataPath, "utf-8"));
      
      const targetTheaterId = dbTheaters["star-cineplex-bashundhara-city"];
      const [targetScreen] = await db.select().from(cinemaScreens).where(eq(cinemaScreens.theatreId, targetTheaterId)).limit(1);
      const [standardSeatType] = await db.select().from(seatType).where(and(eq(seatType.theaterId, targetTheaterId), eq(seatType.name, "Standard"))).limit(1);

      if (targetScreen && standardSeatType) {
        await db.update(cinemaScreens).set({
          seatLayout: seatData,
        }).where(eq(cinemaScreens.id, targetScreen.id));

        const seatsToInsert = seatData.seats.map((s: any) => ({
          screenId: targetScreen.id,
          row: s.row,
          seatNumber: s.seatNumber,
          seatTypeId: standardSeatType.id,
          posX: s.x.toString(),
          posY: s.y.toString(),
          isAccessible: false,
          isActive: true,
        }));
        
        if (seatsToInsert.length > 0) {
          await db.delete(seats).where(eq(seats.screenId, targetScreen.id));
          await db.insert(seats).values(seatsToInsert);
          console.log(`Successfully seeded ${seatsToInsert.length} seats for ${targetScreen.name}`);
        }
      }
    } else {
      console.log("data.json not found, skipping seats seeding.");
    }
  } catch (err) {
    console.error("Failed to seed seats from data.json:", err);
  }

  console.log("Seeding completed successfully!");
  process.exit(0);
}

main().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
