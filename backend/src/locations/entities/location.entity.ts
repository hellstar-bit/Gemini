// backend/src/locations/entities/location.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn, Index } from 'typeorm';

@Entity('locations')
@Index(['code'], { unique: true, where: 'code IS NOT NULL' })
export class Location {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'enum', enum: ['department', 'municipality', 'neighborhood', 'zone'] })
  type: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  code: string; // Código DANE u otro código oficial

  @Column({ name: 'parent_id', nullable: true })
  parentId: number;

  @ManyToOne(() => Location, location => location.children)
  @JoinColumn({ name: 'parent_id' })
  parent: Location;

  @OneToMany(() => Location, location => location.parent)
  children: Location[];

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  latitude: number;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  longitude: number;

  @Column({ type: 'int', default: 0 })
  population: number; // Población estimada

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}