export interface Notification {
    title: string,
    description?: string,
    actions?: Action[]
    type: NotificationType
}

export interface Action {
    text: string,
    href: string,
}

export enum NotificationType {
    ALERT,
    TOAST
}