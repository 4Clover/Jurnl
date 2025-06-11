import type { SerializableUser } from '$lib/server/database/schemas';

export interface UserProfileFormProps {
    userInfo: SerializableUser | null;
}
