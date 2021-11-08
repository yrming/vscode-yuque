// declare module '@yuque/sdk'
export interface YuqueAuthData {
	accessToken: string | undefined
}

export interface YuqueUserBase {
    avatar_url: string,
    created_at: string,
    description?: string
    followers_count: number,
    following_count: number,
    id: number,
    login: string,
    name: string,
    type: string,
    updated_at: string,
    _serializer: string,
}
export interface YuqueUserDetail {
	account_id: number,
	avatar_url: string,
	books_count: number,
	created_at: string,
	description?: string
	followers_count: number,
	following_count: number,
	id: number,
	login: string,
	name: string,
	public: number,
	public_books_count: number,
	space_id: number,
	type: string,
	updated_at: string,
	_serializer: string,
}

export interface YuqueGroup {
	avatar_url: string,
	books_count: number,
	created_at: string,
	description?: string
	id: number,
	login: string,
	members_count: number,
	name: string,
	public: number,
	public_books_count: number,
	public_topics_count: number,
	topics_count: number,
	type: string,
	updated_at: string,
	_serializer: string
}

export interface YuqueRepo {
    content_updated_at: string,
    created_at: string,
    creator_id: number,
    description?: string
    id: number,
    items_count: number,
    likes_count: number,
    name: string,
    namespace: string,
    public: number,
    slug: string,
    type: string,
    updated_at: string,
    user: YuqueUserBase,
    user_id: number,
    watches_count: number,
    _serializer: string,
	__docs?: YuqueDoc[] | null
}

export interface YuqueDoc {
	book: YuqueRepo | null,
	book_id: number,
	comments_count: number,
	content_updated_at: string,
	cover: string | null,
	created_at: string,
	custom_description: string | null
	description: string | null,
	draft_version: number,
	first_published_at: string | null,
	format: string,
	id: number,
	last_editor: YuqueUserBase,
	last_editor_id: number,
	likes_count: number,
	public: number,
	published_at: string | null,
	read_status: number,
	slug: string,
	status: number,
	title: string,
	updated_at: string,
	user_id: number,
	view_status: number,
	word_count: number,
	_serializer: string,
}