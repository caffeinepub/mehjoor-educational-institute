import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Announcement {
    id: bigint;
    title: string;
    content: string;
    timestamp: bigint;
}
export interface Inquiry {
    id: bigint;
    name: string;
    message: string;
    timestamp: bigint;
    classLevel: string;
}
export interface Assessment {
    id: bigint;
    title: string;
    subject: string;
    date: bigint;
    description: string;
    timestamp: bigint;
    classLevel: string;
}
export interface backendInterface {
    addAnnouncement(title: string, content: string): Promise<bigint>;
    addAssessment(title: string, subject: string, classLevel: string, date: bigint, description: string): Promise<bigint>;
    addInquiry(name: string, classLevel: string, message: string): Promise<bigint>;
    getAnnouncement(id: bigint): Promise<Announcement>;
    getAnnouncements(): Promise<Array<Announcement>>;
    getAssessment(id: bigint): Promise<Assessment>;
    getAssessments(): Promise<Array<Assessment>>;
    getInquiries(): Promise<Array<Inquiry>>;
    getInquiriesOwner(): Promise<Array<Inquiry>>;
    getOwner(): Promise<Principal | null>;
    setOwner(): Promise<void>;
}
