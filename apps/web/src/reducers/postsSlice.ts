import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface Author {
  user_id?: number;
  username?: string;
  profile_picture?: string | null;
}

export interface Post {
    post_id: string | number;
    title?: string;
    body?: string;
    content?: string;
    created_at?: string;
    image_url?: string[] | string | null;
    author_id?: number;
    author?: Author | null;
}

export interface PostItem extends Post {
    bg: string;
    icon: string;
    removable: boolean;
}

interface PostsState {
    list: PostItem[];
}

const colors: { bg: string; icon: string }[] = [
    { bg: '#E5F6FF', icon: '#E5F6FF' },
    { bg: '#F1E9FF', icon: '#B792E5' },
    { bg: '#EEFFE3', icon: '#82D62E' },
    { bg: '#FFFCE3', icon: '#FFE000' },
    { bg: '#E9FFF0', icon: '#72B7A7' },
];

const initialState: PostsState = {
    list: [],
};

const postsSlice = createSlice({
    name: 'posts',
    initialState,
    reducers: {
        mergePosts: (state, action: PayloadAction<Post[]>) => {
            const fetchedPosts = action.payload.map((post, index) => {
                const overallIndex = state.list.length + index;
                const color = colors[overallIndex % colors.length];
                return { ...post, ...color, removable: false } as PostItem;
            });
            state.list = [...state.list, ...fetchedPosts];
        },
        setPosts: (state, action: PayloadAction<Post[]>) => {
            const fetchedPosts = action.payload.map((post, index) => {
                const color = colors[index % colors.length];
                return { ...post, ...color, removable: false } as PostItem;
            });
            state.list = fetchedPosts;
        },
        addPost: (state, action: PayloadAction<Post>) => {
            const newPost = action.payload;
            const index = state.list.length;
            const color = colors[index % colors.length];
            state.list.unshift({ ...newPost, ...color, removable: true } as PostItem);
        },
        deletePost: (state, action: PayloadAction<string | number>) => {
            state.list = state.list.filter((post) => post.post_id !== action.payload);
        },
    },
});

export const { mergePosts, setPosts, addPost, deletePost } = postsSlice.actions;
export default postsSlice.reducer;