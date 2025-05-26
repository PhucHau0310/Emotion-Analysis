import NextAuth from 'next-auth';
import GithubProvider from 'next-auth/providers/github';
import GoogleProvider from 'next-auth/providers/google';
import FacebookProvider from 'next-auth/providers/facebook';

const handler = NextAuth({
    providers: [
        GithubProvider({
            clientId: process.env.GITHUB_ID ?? '',
            clientSecret: process.env.GITHUB_SECRET ?? '',
        }),

        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID ?? '',
            clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
        }),

        FacebookProvider({
            clientId: process.env.FACEBOOK_CLIENT_ID ?? '',
            clientSecret: process.env.FACEBOOK_CLIENT_SECRET ?? '',
        }),
        // ...add more providers here
    ],
    callbacks: {
        async jwt({ token, account }: { token: any; account?: any }) {
            // Persist the OAuth access_token to the token right after signin
            if (account?.access_token) {
                token.accessToken = account.access_token;
            }
            return token;
        },
        async session({
            session,
            token,
            user,
        }: {
            session: any;
            token: any;
            user: any;
        }) {
            // Send properties to the client, like an access_token from a provider.
            session.accessToken = token.accessToken;
            session.user.id = token.id;
            return session;
        },
    },
});

export { handler as GET, handler as POST };
