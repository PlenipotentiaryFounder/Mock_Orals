import postgres from 'postgres'

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:B9bB1lh0oGvp4Ekk@db.psnorowqvedupuievxnh.supabase.co:5432/postgres'
const sql = postgres(connectionString)

export default sql 