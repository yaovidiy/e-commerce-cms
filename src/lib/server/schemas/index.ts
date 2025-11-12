import * as v from 'valibot';

export const CreateBlogSchema = v.object({
    title: v.pipe(v.string(), v.minLength(1), v.maxLength(200)),
    content: v.pipe(v.string(), v.minLength(1)),
    slug: v.pipe(v.string(), v.minLength(1), v.maxLength(200)),
    authorId: v.string()
});

export const UpdateBlogSchema = v.object({
    id: v.string(),
    title: v.pipe(v.string(), v.minLength(1), v.maxLength(200)),
    content: v.pipe(v.string(), v.minLength(1)),
    slug: v.pipe(v.string(), v.minLength(1), v.maxLength(200)),
});