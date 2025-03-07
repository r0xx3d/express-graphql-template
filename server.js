const express = require('express')
const { graphqlHTTP } = require('express-graphql')

const {
	GraphQLSchema,
	GraphQLObjectType,
	GraphQLString,
	GraphQLList,
	GraphQLInt,
	GraphQLNonNull
} = require('graphql')

const app = express()

const authors = [

	{ id: 1, name: 'Immanuel Kant' },
	{ id: 2, name: 'GWF Hegel'},
	{ id: 3, name: 'Friedrich Nietzsche'}
]

const books = [

	{ id: 1, name: 'Critique of Pure Reason', authorID: 1 },
        { id: 2, name: 'Critique of Practical Reason', authorID: 1 },
	{ id: 3, name: 'Critique of Judgement', authorID: 1 },
	{ id: 4, name: 'The Phenomenology of Spirit', authorID: 2 },
	{ id: 5, name: 'Science of Logic', authorID: 2 },
	{ id: 6, name: 'Lectures on the Philosophy of History', authorID: 2 },
	{ id: 7, name: 'Thus Spoke Zarathustra', authorID: 3 },
	{ id: 8, name: 'Genealogy of Morals', authorID: 3 },
	{ id: 9, name: 'Beyond Good and Evil', authorID: 3 }
]

const BookType = new GraphQLObjectType ({
	name: 'Book',
	description: 'This represents a book written by an author',
	fields: () => ({
		id: { type: GraphQLNonNull(GraphQLInt) },
		name: { type: GraphQLNonNull(GraphQLString) },
		authorID: { type: GraphQLNonNull(GraphQLInt) },
		author: {
			type: AuthorType,
			resolve: (book) => {
				return authors.find(author => author.id === book.authorID)
			}
		}
	})
})


const AuthorType = new GraphQLObjectType ({
        name: 'Author',
        description: 'This represents the author of the book',
        fields: () => ({
                id: { type: GraphQLNonNull(GraphQLInt) },
                name: { type: GraphQLNonNull(GraphQLString) },
		books: {
			type: new GraphQLList(BookType),
			resolve: (author) => {
				return books.filter(book => book.authorID === author.id)
			}
		}
        })
})


const RootQueryType = new GraphQLObjectType({
	name: 'Query',
	description: 'Root Query',
	fields: () => ({
		book:{
			type: BookType,
			description: 'A Single Book',
			args: {
				id: { type: GraphQLInt }
			},
			resolve: (parent, args) => books.find(book => book.id == args.id)

		},
		books: {
			type: new GraphQLList(BookType),
			description: 'List of all Books',
			resolve: () => books	
		},
		authors: {
			type: new GraphQLList(AuthorType),
			description: 'List of all Authors',
			resolve: () => authors

		},
		author: {
			type: AuthorType,
			description: 'A Single Author',
			args: {
				id: { type: GraphQLInt }
			},
			resolve: (parent, args) => authors.find(author => author.id === args.id)

		}

	})
})

const RootMutationType = new GraphQLObjectType ({

		name: 'Mutation',
		description: 'Root Mutation',
		fields: () => ({
			addBook: {
			type: BookType,
			description: 'Add a book',
			args: {
				name: { type: GraphQLNonNull(GraphQLString)},
				authorID: { type: GraphQLNonNull(GraphQLInt) }
			},
			resolve: (parent, args) => {
				const book = { id: books.length + 1, name: args.name, authorID: args.authorID}
			books.push(book)
			return book
			}
			},
			addAuthor: {
			type: AuthorType,
			description: 'Add an author',
			args: {
				name: { type: GraphQLNonNull(GraphQLString)},
			},
			resolve: (parent, args) => {
				const author = { id: authors.length + 1, name: args.name}
			authors.push(author)
			return author
			}
			}		
			
		})







})


const schema = new GraphQLSchema({
	query: RootQueryType,
	mutation: RootMutationType
})


app.use('/graphql', graphqlHTTP({
	schema: schema,
	graphiql: true
}))
app.listen(5000., () => console.log('Server Running'))
