const { GraphQLServer } = require('graphql-yoga');
const { prisma } = require('./generated/prisma-client');

async function main() {
  // Create a new link
  // const newLink = await prisma.createLink({
  //   url: 'www.prisma.io',
  //   description: 'Prisma replaces traditional ORMs',
  // });
  // console.log(`Created new link: ${newLink.url} (ID: ${newLink.id})`);

  // Read all links from the database and print them to the console
  const allLinks = await prisma.links();
  console.log(allLinks);
}

main().catch(e => console.error(e));
// 1

const resolvers = {
  // Query: {
  //   info: () => `This is the API of a Hackernews Clone`,
  //   feed: () => links,
  //   link: (parent, args) => links.find(link => link.id === `link-${args.id}`),
  // },
  Query: {
    info: () => `This is the API of a Hackernews Clone`,
    feed: (root, args, context, info) => {
      return context.prisma.links();
    },
  },
  Mutation: {
    post: (root, args, context) => {
      return context.prisma.createLink({
        url: args.url,
        description: args.description,
      });
    },
    deleteLink: async (root, args, context, info) => {
      await context.prisma.deleteLink({ id: args.id });
      return `link ${args.id} deleted`;
    },
    updateLink: (root, args, context, info) => {
      return context.prisma.updateLink({
        where: { id: args.id },
        data: { url: args.url, description: args.description },
      });
    },
    // deleteLink: (parent, args) => {
    //   links = links.filter(link => link.id !== `link-${args.id}`);
    //   return `You deleted link-${args.id}`;
    // },
    // updateLink: (parent, args) => {
    //   const link = links.find(link => link.id === `link-${args.id}`);
    //   if (args.url) {
    //     link.url = args.url;
    //   }
    //   if (args.description) {
    //     link.description = args.description;
    //   }
    //   return link;
    // },
  },
};

const server = new GraphQLServer({
  typeDefs: './src/schema.graphql',
  resolvers,
  context: { prisma },
});
server.start(() => console.log(`Server is running on http://localhost:4000`));
