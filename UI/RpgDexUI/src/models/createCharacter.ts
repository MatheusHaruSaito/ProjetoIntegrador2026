import { Attributes } from "./attributes"
import { Skills } from "./skills"

export interface CreateCharacter{
    id : string
    userId : string
    icon : File
    name : string
    description? :string
    properties? :Record<string, any>
}
