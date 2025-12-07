import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { persistToken } from '../features/authSlice';
import type { RootState } from '../store';
import type {
  ApiAuthResponse,
  CreateReactionDto,
  CreateWebhookDto,
  Reaction,
  Repository,
  User,
  Webhook,
} from '../types';

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: async (args, api, extraOptions) => {
    const baseUrl = (api.getState() as RootState).config.baseUrl;
    const rawBaseQuery = fetchBaseQuery({
      baseUrl,
      prepareHeaders: (headers, { getState }) => {
        const token = (getState() as RootState).auth.token;
        if (token) {
          headers.set('Authorization', `Bearer ${token}`);
        }
        return headers;
      },
    });
    return rawBaseQuery(args, api, extraOptions);
  },
  tagTypes: ['User', 'Repos', 'Webhooks', 'Reactions'],
  endpoints: (builder) => ({
    login: builder.mutation<
      ApiAuthResponse,
      { email: string; password: string }
    >({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
      async onQueryStarted(args, { dispatch, queryFulfilled }) {
        const { data } = await queryFulfilled;
        dispatch(persistToken(data.access_token));
      },
      invalidatesTags: ['User'],
    }),
    register: builder.mutation<
      { id: number; email: string; name: string; token: string },
      { email: string; password: string; name: string }
    >({
      query: (userInfo) => ({
        url: '/auth/register',
        method: 'POST',
        body: userInfo,
      }),
      async onQueryStarted(args, { dispatch, queryFulfilled }) {
        const { data } = await queryFulfilled;
        dispatch(persistToken(data.token));
      },
    }),
    getProfile: builder.query<User, void>({
      query: () => '/auth/me',
      providesTags: ['User'],
    }),
    getGithubAuthUrl: builder.query<{ url: string }, void>({
      query: () => '/auth/github',
    }),
    listRepositories: builder.query<Repository[], void>({
      query: () => '/github/repositories',
      providesTags: ['Repos'],
    }),
    listWebhooks: builder.query<Webhook[], { owner: string; repo: string }>({
      query: ({ owner, repo }) =>
        `/github/repositories/${owner}/${repo}/webhooks`,
      providesTags: (result, error, { repo }) => [
        { type: 'Webhooks', id: repo },
      ],
    }),
    createWebhook: builder.mutation<Webhook, CreateWebhookDto>({
      query: (dto) => ({
        url: '/github/create-webhook',
        method: 'POST',
        body: dto,
      }),
      invalidatesTags: (result, error, dto) => [
        { type: 'Webhooks', id: dto.repo },
      ],
    }),

    listReactions: builder.query<Reaction[], void>({
      query: () => '/reactions',
      providesTags: ['Reactions'],
    }),
    createReaction: builder.mutation<Reaction, CreateReactionDto>({
      query: (dto) => ({
        url: '/reactions',
        method: 'POST',
        body: dto,
      }),
      invalidatesTags: ['Reactions'],
    }),
    deleteReaction: builder.mutation<void, number>({
      query: (id) => ({
        url: `/reactions/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Reactions'],
    }),

    listUserWebhooks: builder.query<Webhook[], void>({
      query: () => '/users/webhooks',
      providesTags: ['Webhooks'],
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useGetProfileQuery,
  useGetGithubAuthUrlQuery,
  useListRepositoriesQuery,
  useListWebhooksQuery,
  useCreateWebhookMutation,
  useListReactionsQuery,
  useCreateReactionMutation,
  useDeleteReactionMutation,
  useListUserWebhooksQuery,
} = apiSlice;
