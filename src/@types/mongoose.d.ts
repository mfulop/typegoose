import { Schema } from "mongoose";

declare module 'mongoose' {
  interface Schema {
    extend: (schema: Schema) => Schema
  }
}