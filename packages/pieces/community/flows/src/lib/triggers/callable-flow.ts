
import { createTrigger, Property, TriggerStrategy } from '@activepieces/pieces-framework';
export const callableFlow = createTrigger({
    // auth: check https://www.activepieces.com/docs/developers/piece-reference/authentication,
    name: 'callableFlow',
    displayName: 'Callable Flow',
    description: 'Waiting to be triggered from another flow',
    props: {
        exampleData: Property.Json({ 
            displayName: 'Sample Data', 
            description: 'The schema to be passed to the flow', 
            required: true,
        }),
    },
    sampleData: {
        
    },
    type: TriggerStrategy.WEBHOOK,
    async onEnable(){
        // ignore
    },
    async onDisable(){
        // ignore
    },
    async test(context){
        return [context.propsValue.exampleData]
    },
    async run(context){
        return [context.payload.body]
    }
})