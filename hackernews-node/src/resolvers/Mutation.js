const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { APP_SECRET, getUserId } = require('../utils');

function post(parent, args, context, info) {
  const userId = getUserId(context);
  return context.prisma.createLink({
    url: args.url,
    description: args.description,
    postedBy: { connect: { id: userId } },
  });
}

// function post(root, args, context) {
//   return context.prisma.createLink({
//     url: args.url,
//     description: args.description,
//   });
// }

async function deleteLink(root, args, context, info) {
  await context.prisma.deleteLink({ id: args.id });
  return `link ${args.id} deleted`;
}

function updateLink(root, args, context, info) {
  return context.prisma.updateLink({
    where: { id: args.id },
    data: { url: args.url, description: args.description },
  });
}

async function signup(parent, args, context, info) {
  const password = await bcrypt.hash(args.password, 10);
  const user = await context.prisma.createUser({ ...args, password });

  const token = jwt.sign({ userId: user.id }, APP_SECRET);
  return {
    token,
    user,
  };
}

async function login(parent, args, context, info) {
  const user = await context.prisma.user({ email: args.email });
  if (!user) {
    throw new Error('No such user found');
  }

  const valid = await bcrypt.compare(args.password, user.password);
  if (!valid) {
    throw new Error('Invalid password');
  }

  const token = jwt.sign({ userId: user.id }, APP_SECRET);

  return {
    token,
    user,
  };
}

module.exports = {
  signup,
  login,
  post,
  deleteLink,
  updateLink,
};
