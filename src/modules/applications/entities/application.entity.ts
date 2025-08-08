import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('orders')
export class Application {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    surname: string;

    @Column()
    email: string;

    @Column()
    phone: string;

    @Column()
    age: number;

    @Column()
    course: string;

    @Column()
    course_format: string;

    @Column()
    course_type: string;

    @Column()
    status: string;

    @Column()
    sum: number;

    @Column()
    alreadyPaid: number;

    @Column()
    created_at: Date;
}
