import { GraphQLObjectType } from 'graphql';
import { GraphQLString } from 'graphql';

export const Test = new GraphQLObjectType({
	name: 'Test',
	fields: () => ({
		id: { type: GraphQLString },
		first_name: { type: GraphQLString },
		last_name: { type: GraphQLString },
	}),
});

// Test._typeConfig = {
// 	sqlTable: 'test',
// 	uniqueKey: 'id',
// };
