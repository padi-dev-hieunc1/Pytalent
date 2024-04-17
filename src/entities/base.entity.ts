import { BeforeInsert, BeforeUpdate, Column } from 'typeorm';

export class BaseEntity {
  @Column({
    // default: () => new Date(new Date().getTime() + 7 * 60 * 60 * 1000),
    default: () => new Date(),
  })
  created_at: Date;

  @Column({
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updated_at: Date;

  @BeforeInsert()
  setCreatedAt(): void {
    this.created_at = new Date(new Date().getTime() + 7 * 60 * 60 * 1000);
  }

  @BeforeUpdate()
  setUpdatedAt(): void {
    this.updated_at = new Date(new Date().getTime() + 7 * 60 * 60 * 1000);
  }
}
