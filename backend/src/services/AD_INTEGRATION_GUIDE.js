/*
 * ─── PANDUAN INTEGRASI ACTIVE DIRECTORY ─────────────────────────────────────
 *
 * Untuk mengintegrasikan Active Directory (LDAP) sebagai pengganti autentikasi
 * bcrypt saat ini, ikuti langkah-langkah berikut:
 *
 * Langkah 1: Instalasi library LDAP
 *   npm install ldapjs
 *   # Atau untuk SAML/OAuth2:
 *   # npm install passport-saml
 *
 * Langkah 2: Ganti fungsi loginWithCredentials di auth.service.js
 *
 * SEBELUM (bcrypt — saat ini):
 * ─────────────────────────────
 * export async function loginWithCredentials(username, password) {
 *     const user = await prisma.user.findUnique({ where: { username } });
 *     if (!user) throw new Error('INVALID_CREDENTIALS');
 *     const valid = await bcrypt.compare(password, user.password);
 *     if (!valid) throw new Error('INVALID_CREDENTIALS');
 *     ...
 * }
 *
 * SESUDAH (LDAP — Active Directory):
 * ─────────────────────────────────────
 * import ldap from 'ldapjs';
 *
 * export async function loginWithCredentials(username, password) {
 *     // 1. Verifikasi kredensial ke Active Directory via LDAP bind
 *     await verifyLdap(username, password); // Throws jika gagal
 *
 *     // 2. Cari atau buat user di database lokal berdasarkan username AD
 *     let user = await prisma.user.findUnique({ where: { username } });
 *     if (!user) {
 *         // Auto-provisioning: buat user baru dari AD jika belum ada
 *         user = await prisma.user.create({
 *             data: { username, password: '', role: 'user' }
 *         });
 *     }
 *
 *     // 3. Generate JWT tokens (TIDAK BERUBAH dari implementasi saat ini)
 *     const { accessToken, refreshToken } = generateTokens(user);
 *     await prisma.user.update({ where: { id: user.id }, data: { refreshToken } });
 *
 *     return { user: { id: user.id, username: user.username, role: user.role }, accessToken, refreshToken };
 * }
 *
 * async function verifyLdap(username, password) {
 *     return new Promise((resolve, reject) => {
 *         const client = ldap.createClient({ url: process.env.LDAP_URL });
 *         const userDN = `cn=${username},${process.env.LDAP_BASE_DN}`;
 *         client.bind(userDN, password, (err) => {
 *             client.destroy();
 *             if (err) reject(new Error('INVALID_CREDENTIALS'));
 *             else resolve();
 *         });
 *     });
 * }
 *
 * Langkah 3: Tambahkan variabel lingkungan berikut ke .env:
 *   LDAP_URL="ldap://your-ad-server.company.local"
 *   LDAP_BASE_DN="dc=company,dc=local"
 *
 * Catatan Penting:
 * - auth.controller.js dan seluruh JWT session handling TIDAK PERLU DIUBAH
 * - Refresh token, logout, dan route protection tetap bekerja sama persis
 * - Hanya bagian verifikasi kredensial di auth.service.js yang diganti
 * ─────────────────────────────────────────────────────────────────────────────
 */
