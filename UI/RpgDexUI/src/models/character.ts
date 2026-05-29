import { Attributes } from "./attributes"
import { Skills } from "./skills"

export interface Character{
    id : string
    userId : string
    iconPath : string
    name : string
    description? :string
    properties? :Record<string, any>
}
