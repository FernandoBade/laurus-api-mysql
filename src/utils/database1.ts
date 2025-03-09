import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const db = mysql.createPool({
    host: process.env.DB_URL,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});

class BaseModel {
    static tableName: string;

    static async find(conditions: Record<string, any>) {
        const tableName = this.tableName || this.name.toLowerCase();
        const keys = Object.keys(conditions);
        const values = Object.values(conditions);

        const whereClause = keys.length ? `WHERE ${keys.map(key => `${key} = ?`).join(" AND ")}` : "";
        const query = `SELECT * FROM ${tableName} ${whereClause}`;

        const [results]: any = await db.query(query, values);
        return results;
    }

    static async save(data: Record<string, any>) {
        const tableName = this.tableName || this.name.toLowerCase();
        const keys = Object.keys(data);
        const values = Object.values(data);

        const columns = keys.join(", ");
        const placeholders = keys.map(() => "?").join(", ");
        const query = `INSERT INTO ${tableName} (${columns}) VALUES (${placeholders})`;

        const [result]: any = await db.query(query, values);
        return { id: result.insertId, ...data };
    }

    static async update(id: number, data: Record<string, any>) {
        const tableName = this.tableName || this.name.toLowerCase();
        const keys = Object.keys(data);
        const values = Object.values(data);

        const setClause = keys.map(key => `${key} = ?`).join(", ");
        const query = `UPDATE ${tableName} SET ${setClause} WHERE id = ?`;

        await db.query(query, [...values, id]);
        return this.find({ id });
    }

    static async delete(id: number) {
        const tableName = this.tableName || this.name.toLowerCase();
        const query = `DELETE FROM ${tableName} WHERE id = ?`;
        await db.query(query, [id]);
        return true;
    }

    static async runQuery(sql: string, params: any[] = []) {
        return await db.query(sql, params);
    }
}

export default BaseModel;
