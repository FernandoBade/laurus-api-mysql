import "reflect-metadata";
import { ColumnType } from "../../enum";

/**
 * Table decorator to associate a class with a database table.
 * @param name The name of the table.
 * @returns A class decorator function.
 */
export function Table(name: string) {
    return function (constructor: Function) {
        const tableName = name.toLowerCase();
        Reflect.defineMetadata("tableName", tableName, constructor);
        (constructor as any).tableName = tableName;
    };
}

/**
/**
 * Property decorator to define column metadata (type, default, enum, constraints).
 * Used for schema generation and automatic migration detection.

 * @param options Options for the column. defaultValue, enumValues, index, onUpdate, type, unique.
 * @returns A property decorator function.
 */
export function Column(options?: {
    defaultValue?: any,
    enumValues?: string[],
    index?: boolean,
    onUpdate?: boolean,
    type?: ColumnType | string,
    unique?: boolean
}) {
    return function (target: any, propertyKey: string) {
        if (propertyKey === "id") return;

        if (!Reflect.hasMetadata("columns", target.constructor)) {
            Reflect.defineMetadata("columns", [], target.constructor);
        }

        const columns = Reflect.getMetadata("columns", target.constructor);
        columns.push({
            name: propertyKey,
            defaultValue: options?.defaultValue,
            enumValues: options?.enumValues,
            index: options?.index,
            onUpdate: options?.onUpdate,
            type: options?.type || ColumnType.VARCHAR,
            unique: options?.unique
        });

        Reflect.defineMetadata("columns", columns, target.constructor);
    };
}

/**
 * Defines a One-to-Many relationship.
 * @param target The target class of the relationship.
 * @param inverse The inverse property of the relationship.
 * @returns A property decorator function.
 */
export function OneToMany(target: () => Function, inverse: string) {
    return function (targetClass: any, propertyKey: string) {
        if (!Reflect.hasMetadata("relationships", targetClass.constructor)) {
            Reflect.defineMetadata("relationships", [], targetClass.constructor);
        }
        const relationships = Reflect.getMetadata("relationships", targetClass.constructor);
        relationships.push({ type: "OneToMany", propertyKey, target, inverse });
        Reflect.defineMetadata("relationships", relationships, targetClass.constructor);
    };
}

/**
 * Defines a Many-to-One relationship.
 * @param target The target class of the relationship.
 * @param inverse The inverse property of the relationship.
 * @returns A property decorator function.
 */
export function ManyToOne(target: () => Function, inverse: string) {
    return function (targetClass: any, propertyKey: string) {
        if (!Reflect.hasMetadata("relationships", targetClass.constructor)) {
            Reflect.defineMetadata("relationships", [], targetClass.constructor);
        }
        const relationships = Reflect.getMetadata("relationships", targetClass.constructor);

        relationships.push({
            type: "ManyToOne",
            propertyKey,
            target,
            inverse
        });

        Reflect.defineMetadata("relationships", relationships, targetClass.constructor);
    };
}


/**
 * Defines a Many-to-Many relationship.
 * @param target The target class of the relationship.
 * @param joinTable The name of the join table.
 * @returns A property decorator function.
 */
export function ManyToMany(target: () => Function, joinTable: string) {
    return function (targetClass: any, propertyKey: string) {
        if (!Reflect.hasMetadata("relationships", targetClass.constructor)) {
            Reflect.defineMetadata("relationships", [], targetClass.constructor);
        }
        const relationships = Reflect.getMetadata("relationships", targetClass.constructor);
        relationships.push({ type: "ManyToMany", propertyKey, target, joinTable });
        Reflect.defineMetadata("relationships", relationships, targetClass.constructor);
    };
}

/**
 * Defines a One-to-One relationship.
 * @param target The target class of the relationship.
 * @param inverse The inverse property of the relationship.
 * @returns A property decorator function.
 */
export function OneToOne(target: () => Function, inverse: string) {
    return function (targetClass: any, propertyKey: string) {
        if (!Reflect.hasMetadata("relationships", targetClass.constructor)) {
            Reflect.defineMetadata("relationships", [], targetClass.constructor);
        }
        const relationships = Reflect.getMetadata("relationships", targetClass.constructor);
        relationships.push({ type: "OneToOne", propertyKey, target, inverse });
        Reflect.defineMetadata("relationships", relationships, targetClass.constructor);
    };
}
