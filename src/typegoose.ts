import 'reflect-metadata';
import 'mongoose-schema-extend';
import * as mongoose from 'mongoose';
import * as _ from 'lodash';

(mongoose as any).Promise = global.Promise;

import { schema, models, methods, virtuals, hooks, plugins, constructors } from './data';

export * from './method';
export * from './prop';
export * from './hooks';
export * from './plugin';
export { getClassForDocument } from './utils';

export type InstanceType<T> = T & mongoose.Document;
export type ModelType<T> = mongoose.Model<InstanceType<T>> & T;

export interface GetModelForClassOptions {
  existingMongoose?: mongoose.Mongoose;
  schemaOptions?: mongoose.SchemaOptions;
  existingConnection?: mongoose.Connection;
}

export class Typegoose {
  getModelForClass<T>(t: T, {
    existingMongoose,
    schemaOptions,
    existingConnection,
  }: GetModelForClassOptions = {}) {
    const name = this.constructor.name;
    if (!models[name]) {
      this.setModelForClass(t, { existingMongoose, schemaOptions, existingConnection });
    }

    return models[name] as ModelType<this> & T;
  }

  setModelForClass<T>(t: T, {
    existingMongoose,
    schemaOptions,
    existingConnection,
  }: GetModelForClassOptions = {}) {
    const name = this.constructor.name;

    // get parents class name
    const parentCtor = Object.getPrototypeOf(this.constructor.prototype).constructor;
    let sch;

    if (parentCtor.name !== 'Typegoose' && parentCtor.name !== 'Object') {
      sch = this.buildSchema(name, schemaOptions, parentCtor.name);
    } else {
      sch = this.buildSchema(name, schemaOptions);
    }

    // bind to mongoose connection
    let model = mongoose.model.bind(mongoose);
    if (existingConnection) {
        model = existingConnection.model.bind(existingConnection);
      } else if (existingMongoose) {
        model = existingMongoose.model.bind(existingMongoose);
      }

    models[name] = model(name, sch);
    constructors[name] = this.constructor;

    return models[name] as ModelType<this> & T;
  }

  private buildSchema(name: string, schemaOptions, extendFrom?: string) {
    const Schema = mongoose.Schema;
    let sch;

    if (extendFrom && schema[extendFrom]) {
      let options;

      if (schemaOptions) {
        options = schemaOptions;
      } else {
        // use schema options from parent
        options = models[extendFrom] && models[extendFrom].schema ? models[extendFrom].schema.options : {};
      }
      sch = new Schema(schema[extendFrom], options).extend(schema[name]);
    } else {
      sch = schemaOptions ?
      new Schema(schema[name], schemaOptions) :
      new Schema(schema[name]);
    }

    const staticMethods = methods.staticMethods[name] || {};
    const parentStaticMethods = methods.staticMethods[extendFrom] || {};
    sch.statics = Object.assign(parentStaticMethods, staticMethods, sch.statics || {});

    const instanceMethods = methods.instanceMethods[name] || {};
    const parentInstanceMethods = methods.instanceMethods[extendFrom] || {};
    sch.methods = Object.assign(parentInstanceMethods, instanceMethods, sch.methods || {});

    if (hooks[name]) {
      const preHooks = hooks[name].pre;
      preHooks.forEach((preHookArgs) => {
        (sch as any).pre(...preHookArgs);
      });
      const postHooks = hooks[name].post;
      postHooks.forEach((postHookArgs) => {
        (sch as any).post(...postHookArgs);
      });
    }

    if (plugins[name]) {
      _.forEach(plugins[name], (plugin) => {
        sch.plugin(plugin.mongoosePlugin, plugin.options);
      });
    }

    const getterSetters = virtuals[name];
    _.forEach(getterSetters, (value, key) => {
      if (value.get) {
        sch.virtual(key).get(value.get);
      }
      if (value.set) {
        sch.virtual(key).set(value.set);
      }
    });
    return sch;
  }
}
