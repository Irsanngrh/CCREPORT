import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    // ─── Admin user ────────────────────────────────────────────────────────────
    const adminHash = await bcrypt.hash('admin', 12);
    await prisma.user.upsert({
        where: { username: 'admin' },
        update: { role: 'admin' },
        create: { username: 'admin', password: adminHash, role: 'admin' },
    });

    // ─── Regular test users ────────────────────────────────────────────────────
    for (const username of ['user1', 'user2', 'user3']) {
        const hash = await bcrypt.hash(username, 12); // password same as username
        await prisma.user.upsert({
            where: { username },
            update: { role: 'user' },
            create: { username, password: hash, role: 'user' },
        });
        console.log(`Seeded user: ${username}`);
    }

    // ─── Directors ─────────────────────────────────────────────────────────────
    const directors = [
        {
            name: 'Jeffry Haryadi P. M.',
            position: 'Direktur Utama',
            creditCards: [{ bankName: 'Bank', cardNumber: '5534-7901-0070-6704' }],
        },
        {
            name: 'Sri Ainin Muktirizka',
            position: 'Direktur SDM dan Hukum',
            creditCards: [{ bankName: 'Bank', cardNumber: '5534-7901-0078-5708' }],
        },
        {
            name: 'Helmi I. Satriyono',
            position: 'Direktur Keuangan dan MR',
            creditCards: [{ bankName: 'Bank', cardNumber: '5534-7901-0070-6506' }],
        },
        {
            name: 'Khaidir Abdurrahman',
            position: 'Direktur Hubungan Kelembagaan / Plt Direktur Investasi',
            creditCards: [{ bankName: 'Bank', cardNumber: '5534-7901-0085-2706' }],
        },
    ];

    for (const director of directors) {
        const existing = await prisma.director.findFirst({ where: { name: director.name } });
        if (!existing) {
            await prisma.director.create({
                data: {
                    name: director.name,
                    position: director.position,
                    creditCards: { create: director.creditCards },
                },
            });
            console.log(`Seeded director: ${director.name}`);
        } else {
            console.log(`Director already exists: ${director.name}`);
        }
    }

    console.log('\n✓ Seed complete');
}

main()
    .then(() => prisma.$disconnect())
    .catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });
