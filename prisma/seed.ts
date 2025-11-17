import { PrismaClient } from '@prisma/client';
// CommonJS環境として実行されるため、bcryptjsのインポートはシンプルに行います
import * as bcrypt from 'bcryptjs'; 

const prisma = new PrismaClient();

async function main() {
  console.log(`Start seeding for test environment...`);

  // 環境変数から管理者情報を取得。設定がなければデフォルト値を使用。
  // テスト環境用の環境変数を設定してください (例: .env.test)
  const ADMIN_EMAIL = process.env.TEST_ADMIN_EMAIL || 'testadmin@xclone.com';
  const ADMIN_PASSWORD = process.env.TEST_ADMIN_PASSWORD || 'password123';

  if (!ADMIN_PASSWORD) {
    console.error('FATAL: TEST_ADMIN_PASSWORD 環境変数が設定されていません。');
    process.exit(1);
  }

  // パスワードをハッシュ化
  const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);


  const adminUser = await prisma.user.upsert({
    where: { email: ADMIN_EMAIL },
    update: {
      password: hashedPassword,
      isAdmin: true,
      isBlocked: false,
    },
    create: {
      email: ADMIN_EMAIL,
      password: hashedPassword,
      name: 'Test Admin User',
      isAdmin: true, // 管理者フラグ
      isBlocked: false,
    },
  });

  console.log(` Created/Updated Admin User: ${adminUser.email}`);
  console.log(` (Password: ${ADMIN_PASSWORD})`);
  

  const trends = [
    { name: 'TypeScript', count: 1250 },
    { name: 'NextJs14', count: 980 },
    { name: 'PrismaORM', count: 820 },
  ];

  for (const trendData of trends) {
    await prisma.trend.upsert({
      where: { name: trendData.name },
      update: { count: trendData.count },
      create: trendData,
    });
  }
  console.log(` Initial trends seeded.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });