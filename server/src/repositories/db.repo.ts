import {
  Model,
  AnyKeys,
  CreateOptions,
  HydratedDocument,
  QueryFilter,
  ProjectionType,
  QueryOptions,
  FlattenMaps,
} from "mongoose";

export abstract class DatabaseRepo<RawDoc> {
  constructor(protected readonly model: Model<RawDoc>) {
    this.model = model;
  }

  async create({
    data,
  }: {
    data: AnyKeys<RawDoc>;
  }): Promise<HydratedDocument<RawDoc>>;

  async create({
    data,
    options,
  }: {
    data: AnyKeys<RawDoc>;
    options: CreateOptions;
  }): Promise<HydratedDocument<RawDoc>[]>;

  public async create({
    data,
    options,
  }: {
    data: AnyKeys<RawDoc>;
    options: CreateOptions | undefined;
  }): Promise<HydratedDocument<RawDoc>[] | HydratedDocument<RawDoc>> {
    const payload = await this.model.create(
      Array.isArray(data) ? data : [data],
      options,
    );
    return Array.isArray(data) ? payload : payload[0]!;
  }

  async findOne({
    filter,
    projection,
    options,
  }: {
    filter: QueryFilter<RawDoc>;
    projection?: ProjectionType<RawDoc> | undefined;
    options: (QueryOptions<RawDoc> & { lean: false }) | null | undefined;
  }): Promise<HydratedDocument<RawDoc> | null>;

  async findOne({
    filter,
    projection,
    options,
  }: {
    filter: QueryFilter<RawDoc>;
    projection?: ProjectionType<RawDoc> | undefined;
    options: (QueryOptions<RawDoc> & { lean: true }) | null | undefined;
  }): Promise<FlattenMaps<RawDoc> | null>;

  public async findOne({
    filter,
    options,
    projection,
  }: {
    filter: QueryFilter<RawDoc>;
    projection?: ProjectionType<RawDoc> | undefined;
    options: QueryOptions<RawDoc> | null | undefined;
  }): Promise<HydratedDocument<RawDoc> | FlattenMaps<RawDoc> | null> {
    const payload = await this.model.findOne(filter, projection, options);
    return payload;
  }
}
