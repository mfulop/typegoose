import { prop } from 'src/typegoose';

export class JobType {
  @prop({ required: true })
  field: string;

  @prop({ required: true })
  salary: number;
}

export class Job {
  @prop()
  title?: string;

  @prop()
  position?: string;

  @prop({ required: true, default: Date.now })
  startedAt?: Date;

  @prop({ _id: false })
  jobType?: JobType;
}
