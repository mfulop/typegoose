import * as mongoose from 'mongoose';
import * as tg from 'src/typegoose';
import { Dog } from './dog';

export class GermanShepherd extends Dog {
  @tg.prop() _type: string;
  @tg.prop() furColor: string;

  @tg.instanceMethod
  public getSound() {
    return 'im a shepherd';
  }
}

export const GermanShepherdModel = new GermanShepherd().getModelForClass(GermanShepherd);
