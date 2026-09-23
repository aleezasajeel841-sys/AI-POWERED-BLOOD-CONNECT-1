export const name = '001-initial-schema';

export async function up({ sequelize }) {
  await sequelize.sync();
}
