import { BeforeInsert, BeforeUpdate, Column } from 'typeorm';

export class BaseEntity {
  @Column({
    name: 'created_at',
    default: () => new Date(),
  })
  createdAt: Date;

  @Column({
    name: 'updated_at',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;

  @BeforeInsert()
  setCreatedAt(): void {
    this.createdAt = new Date();
  }

  @BeforeUpdate()
  setUpdatedAt(): void {
    this.updatedAt = new Date();
  }
}
