/*eslint-disable block-scoped-var, id-length, no-control-regex, no-magic-numbers, no-prototype-builtins, no-redeclare, no-shadow, no-var, sort-vars*/
import * as $protobuf from "protobufjs/minimal";

// Common aliases
const $Reader = $protobuf.Reader, $Writer = $protobuf.Writer, $util = $protobuf.util;

// Exported root namespace
const $root = $protobuf.roots["default"] || ($protobuf.roots["default"] = {});

export const flowspec = $root.flowspec = (() => {

    /**
     * Namespace flowspec.
     * @exports flowspec
     * @namespace
     */
    const flowspec = {};

    flowspec.v1 = (function() {

        /**
         * Namespace v1.
         * @memberof flowspec
         * @namespace
         */
        const v1 = {};

        v1.Flow = (function() {

            /**
             * Properties of a Flow.
             * @memberof flowspec.v1
             * @interface IFlow
             * @property {string|null} [schema] Flow schema
             * @property {string|null} [id] Flow id
             * @property {string|null} [title] Flow title
             * @property {string|null} [owner] Flow owner
             * @property {Array.<string>|null} [labels] Flow labels
             * @property {flowspec.v1.IPolicy|null} [policy] Flow policy
             * @property {flowspec.v1.IContext|null} [context] Flow context
             * @property {Object.<string,flowspec.v1.IParameter>|null} [parameters] Flow parameters
             * @property {Array.<flowspec.v1.IRole>|null} [roles] Flow roles
             * @property {flowspec.v1.IArtifacts|null} [artifacts] Flow artifacts
             * @property {flowspec.v1.IEvents|null} [events] Flow events
             * @property {Array.<flowspec.v1.IStep>|null} [steps] Flow steps
             */

            /**
             * Constructs a new Flow.
             * @memberof flowspec.v1
             * @classdesc Represents a Flow.
             * @implements IFlow
             * @constructor
             * @param {flowspec.v1.IFlow=} [properties] Properties to set
             */
            function Flow(properties) {
                this.labels = [];
                this.parameters = {};
                this.roles = [];
                this.steps = [];
                if (properties)
                    for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * Flow schema.
             * @member {string} schema
             * @memberof flowspec.v1.Flow
             * @instance
             */
            Flow.prototype.schema = "";

            /**
             * Flow id.
             * @member {string} id
             * @memberof flowspec.v1.Flow
             * @instance
             */
            Flow.prototype.id = "";

            /**
             * Flow title.
             * @member {string} title
             * @memberof flowspec.v1.Flow
             * @instance
             */
            Flow.prototype.title = "";

            /**
             * Flow owner.
             * @member {string} owner
             * @memberof flowspec.v1.Flow
             * @instance
             */
            Flow.prototype.owner = "";

            /**
             * Flow labels.
             * @member {Array.<string>} labels
             * @memberof flowspec.v1.Flow
             * @instance
             */
            Flow.prototype.labels = $util.emptyArray;

            /**
             * Flow policy.
             * @member {flowspec.v1.IPolicy|null|undefined} policy
             * @memberof flowspec.v1.Flow
             * @instance
             */
            Flow.prototype.policy = null;

            /**
             * Flow context.
             * @member {flowspec.v1.IContext|null|undefined} context
             * @memberof flowspec.v1.Flow
             * @instance
             */
            Flow.prototype.context = null;

            /**
             * Flow parameters.
             * @member {Object.<string,flowspec.v1.IParameter>} parameters
             * @memberof flowspec.v1.Flow
             * @instance
             */
            Flow.prototype.parameters = $util.emptyObject;

            /**
             * Flow roles.
             * @member {Array.<flowspec.v1.IRole>} roles
             * @memberof flowspec.v1.Flow
             * @instance
             */
            Flow.prototype.roles = $util.emptyArray;

            /**
             * Flow artifacts.
             * @member {flowspec.v1.IArtifacts|null|undefined} artifacts
             * @memberof flowspec.v1.Flow
             * @instance
             */
            Flow.prototype.artifacts = null;

            /**
             * Flow events.
             * @member {flowspec.v1.IEvents|null|undefined} events
             * @memberof flowspec.v1.Flow
             * @instance
             */
            Flow.prototype.events = null;

            /**
             * Flow steps.
             * @member {Array.<flowspec.v1.IStep>} steps
             * @memberof flowspec.v1.Flow
             * @instance
             */
            Flow.prototype.steps = $util.emptyArray;

            /**
             * Encodes the specified Flow message. Does not implicitly {@link flowspec.v1.Flow.verify|verify} messages.
             * @function encode
             * @memberof flowspec.v1.Flow
             * @static
             * @param {flowspec.v1.IFlow} message Flow message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Flow.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.schema != null && Object.hasOwnProperty.call(message, "schema"))
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.schema);
                if (message.id != null && Object.hasOwnProperty.call(message, "id"))
                    writer.uint32(/* id 2, wireType 2 =*/18).string(message.id);
                if (message.title != null && Object.hasOwnProperty.call(message, "title"))
                    writer.uint32(/* id 3, wireType 2 =*/26).string(message.title);
                if (message.owner != null && Object.hasOwnProperty.call(message, "owner"))
                    writer.uint32(/* id 4, wireType 2 =*/34).string(message.owner);
                if (message.labels != null && message.labels.length)
                    for (let i = 0; i < message.labels.length; ++i)
                        writer.uint32(/* id 5, wireType 2 =*/42).string(message.labels[i]);
                if (message.policy != null && Object.hasOwnProperty.call(message, "policy"))
                    $root.flowspec.v1.Policy.encode(message.policy, writer.uint32(/* id 6, wireType 2 =*/50).fork()).ldelim();
                if (message.context != null && Object.hasOwnProperty.call(message, "context"))
                    $root.flowspec.v1.Context.encode(message.context, writer.uint32(/* id 7, wireType 2 =*/58).fork()).ldelim();
                if (message.parameters != null && Object.hasOwnProperty.call(message, "parameters"))
                    for (let keys = Object.keys(message.parameters), i = 0; i < keys.length; ++i) {
                        writer.uint32(/* id 8, wireType 2 =*/66).fork().uint32(/* id 1, wireType 2 =*/10).string(keys[i]);
                        $root.flowspec.v1.Parameter.encode(message.parameters[keys[i]], writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim().ldelim();
                    }
                if (message.roles != null && message.roles.length)
                    for (let i = 0; i < message.roles.length; ++i)
                        $root.flowspec.v1.Role.encode(message.roles[i], writer.uint32(/* id 9, wireType 2 =*/74).fork()).ldelim();
                if (message.artifacts != null && Object.hasOwnProperty.call(message, "artifacts"))
                    $root.flowspec.v1.Artifacts.encode(message.artifacts, writer.uint32(/* id 10, wireType 2 =*/82).fork()).ldelim();
                if (message.events != null && Object.hasOwnProperty.call(message, "events"))
                    $root.flowspec.v1.Events.encode(message.events, writer.uint32(/* id 11, wireType 2 =*/90).fork()).ldelim();
                if (message.steps != null && message.steps.length)
                    for (let i = 0; i < message.steps.length; ++i)
                        $root.flowspec.v1.Step.encode(message.steps[i], writer.uint32(/* id 12, wireType 2 =*/98).fork()).ldelim();
                return writer;
            };

            /**
             * Decodes a Flow message from the specified reader or buffer.
             * @function decode
             * @memberof flowspec.v1.Flow
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {flowspec.v1.Flow} Flow
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Flow.decode = function decode(reader, length) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                let end = length === undefined ? reader.len : reader.pos + length, message = new $root.flowspec.v1.Flow(), key, value;
                while (reader.pos < end) {
                    let tag = reader.uint32();
                    switch (tag >>> 3) {
                    case 1: {
                            message.schema = reader.string();
                            break;
                        }
                    case 2: {
                            message.id = reader.string();
                            break;
                        }
                    case 3: {
                            message.title = reader.string();
                            break;
                        }
                    case 4: {
                            message.owner = reader.string();
                            break;
                        }
                    case 5: {
                            if (!(message.labels && message.labels.length))
                                message.labels = [];
                            message.labels.push(reader.string());
                            break;
                        }
                    case 6: {
                            message.policy = $root.flowspec.v1.Policy.decode(reader, reader.uint32());
                            break;
                        }
                    case 7: {
                            message.context = $root.flowspec.v1.Context.decode(reader, reader.uint32());
                            break;
                        }
                    case 8: {
                            if (message.parameters === $util.emptyObject)
                                message.parameters = {};
                            let end2 = reader.uint32() + reader.pos;
                            key = "";
                            value = null;
                            while (reader.pos < end2) {
                                let tag2 = reader.uint32();
                                switch (tag2 >>> 3) {
                                case 1:
                                    key = reader.string();
                                    break;
                                case 2:
                                    value = $root.flowspec.v1.Parameter.decode(reader, reader.uint32());
                                    break;
                                default:
                                    reader.skipType(tag2 & 7);
                                    break;
                                }
                            }
                            message.parameters[key] = value;
                            break;
                        }
                    case 9: {
                            if (!(message.roles && message.roles.length))
                                message.roles = [];
                            message.roles.push($root.flowspec.v1.Role.decode(reader, reader.uint32()));
                            break;
                        }
                    case 10: {
                            message.artifacts = $root.flowspec.v1.Artifacts.decode(reader, reader.uint32());
                            break;
                        }
                    case 11: {
                            message.events = $root.flowspec.v1.Events.decode(reader, reader.uint32());
                            break;
                        }
                    case 12: {
                            if (!(message.steps && message.steps.length))
                                message.steps = [];
                            message.steps.push($root.flowspec.v1.Step.decode(reader, reader.uint32()));
                            break;
                        }
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Gets the default type url for Flow
             * @function getTypeUrl
             * @memberof flowspec.v1.Flow
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            Flow.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/flowspec.v1.Flow";
            };

            return Flow;
        })();

        v1.Policy = (function() {

            /**
             * Properties of a Policy.
             * @memberof flowspec.v1
             * @interface IPolicy
             * @property {string|null} [enforcement] Policy enforcement
             * @property {boolean|null} [tokensRequired] Policy tokensRequired
             * @property {boolean|null} [eventsRequired] Policy eventsRequired
             */

            /**
             * Constructs a new Policy.
             * @memberof flowspec.v1
             * @classdesc Represents a Policy.
             * @implements IPolicy
             * @constructor
             * @param {flowspec.v1.IPolicy=} [properties] Properties to set
             */
            function Policy(properties) {
                if (properties)
                    for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * Policy enforcement.
             * @member {string} enforcement
             * @memberof flowspec.v1.Policy
             * @instance
             */
            Policy.prototype.enforcement = "";

            /**
             * Policy tokensRequired.
             * @member {boolean} tokensRequired
             * @memberof flowspec.v1.Policy
             * @instance
             */
            Policy.prototype.tokensRequired = false;

            /**
             * Policy eventsRequired.
             * @member {boolean} eventsRequired
             * @memberof flowspec.v1.Policy
             * @instance
             */
            Policy.prototype.eventsRequired = false;

            /**
             * Encodes the specified Policy message. Does not implicitly {@link flowspec.v1.Policy.verify|verify} messages.
             * @function encode
             * @memberof flowspec.v1.Policy
             * @static
             * @param {flowspec.v1.IPolicy} message Policy message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Policy.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.enforcement != null && Object.hasOwnProperty.call(message, "enforcement"))
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.enforcement);
                if (message.tokensRequired != null && Object.hasOwnProperty.call(message, "tokensRequired"))
                    writer.uint32(/* id 2, wireType 0 =*/16).bool(message.tokensRequired);
                if (message.eventsRequired != null && Object.hasOwnProperty.call(message, "eventsRequired"))
                    writer.uint32(/* id 3, wireType 0 =*/24).bool(message.eventsRequired);
                return writer;
            };

            /**
             * Decodes a Policy message from the specified reader or buffer.
             * @function decode
             * @memberof flowspec.v1.Policy
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {flowspec.v1.Policy} Policy
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Policy.decode = function decode(reader, length) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                let end = length === undefined ? reader.len : reader.pos + length, message = new $root.flowspec.v1.Policy();
                while (reader.pos < end) {
                    let tag = reader.uint32();
                    switch (tag >>> 3) {
                    case 1: {
                            message.enforcement = reader.string();
                            break;
                        }
                    case 2: {
                            message.tokensRequired = reader.bool();
                            break;
                        }
                    case 3: {
                            message.eventsRequired = reader.bool();
                            break;
                        }
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Gets the default type url for Policy
             * @function getTypeUrl
             * @memberof flowspec.v1.Policy
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            Policy.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/flowspec.v1.Policy";
            };

            return Policy;
        })();

        v1.Context = (function() {

            /**
             * Properties of a Context.
             * @memberof flowspec.v1
             * @interface IContext
             * @property {string|null} [domain] Context domain
             * @property {string|null} [brief] Context brief
             * @property {Array.<string>|null} [links] Context links
             */

            /**
             * Constructs a new Context.
             * @memberof flowspec.v1
             * @classdesc Represents a Context.
             * @implements IContext
             * @constructor
             * @param {flowspec.v1.IContext=} [properties] Properties to set
             */
            function Context(properties) {
                this.links = [];
                if (properties)
                    for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * Context domain.
             * @member {string} domain
             * @memberof flowspec.v1.Context
             * @instance
             */
            Context.prototype.domain = "";

            /**
             * Context brief.
             * @member {string} brief
             * @memberof flowspec.v1.Context
             * @instance
             */
            Context.prototype.brief = "";

            /**
             * Context links.
             * @member {Array.<string>} links
             * @memberof flowspec.v1.Context
             * @instance
             */
            Context.prototype.links = $util.emptyArray;

            /**
             * Encodes the specified Context message. Does not implicitly {@link flowspec.v1.Context.verify|verify} messages.
             * @function encode
             * @memberof flowspec.v1.Context
             * @static
             * @param {flowspec.v1.IContext} message Context message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Context.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.domain != null && Object.hasOwnProperty.call(message, "domain"))
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.domain);
                if (message.brief != null && Object.hasOwnProperty.call(message, "brief"))
                    writer.uint32(/* id 2, wireType 2 =*/18).string(message.brief);
                if (message.links != null && message.links.length)
                    for (let i = 0; i < message.links.length; ++i)
                        writer.uint32(/* id 3, wireType 2 =*/26).string(message.links[i]);
                return writer;
            };

            /**
             * Decodes a Context message from the specified reader or buffer.
             * @function decode
             * @memberof flowspec.v1.Context
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {flowspec.v1.Context} Context
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Context.decode = function decode(reader, length) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                let end = length === undefined ? reader.len : reader.pos + length, message = new $root.flowspec.v1.Context();
                while (reader.pos < end) {
                    let tag = reader.uint32();
                    switch (tag >>> 3) {
                    case 1: {
                            message.domain = reader.string();
                            break;
                        }
                    case 2: {
                            message.brief = reader.string();
                            break;
                        }
                    case 3: {
                            if (!(message.links && message.links.length))
                                message.links = [];
                            message.links.push(reader.string());
                            break;
                        }
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Gets the default type url for Context
             * @function getTypeUrl
             * @memberof flowspec.v1.Context
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            Context.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/flowspec.v1.Context";
            };

            return Context;
        })();

        v1.Parameter = (function() {

            /**
             * Properties of a Parameter.
             * @memberof flowspec.v1
             * @interface IParameter
             * @property {string|null} [type] Parameter type
             * @property {boolean|null} [required] Parameter required
             * @property {string|null} [defaultValue] Parameter defaultValue
             * @property {Array.<string>|null} [enumValues] Parameter enumValues
             * @property {string|null} [example] Parameter example
             */

            /**
             * Constructs a new Parameter.
             * @memberof flowspec.v1
             * @classdesc Represents a Parameter.
             * @implements IParameter
             * @constructor
             * @param {flowspec.v1.IParameter=} [properties] Properties to set
             */
            function Parameter(properties) {
                this.enumValues = [];
                if (properties)
                    for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * Parameter type.
             * @member {string} type
             * @memberof flowspec.v1.Parameter
             * @instance
             */
            Parameter.prototype.type = "";

            /**
             * Parameter required.
             * @member {boolean} required
             * @memberof flowspec.v1.Parameter
             * @instance
             */
            Parameter.prototype.required = false;

            /**
             * Parameter defaultValue.
             * @member {string} defaultValue
             * @memberof flowspec.v1.Parameter
             * @instance
             */
            Parameter.prototype.defaultValue = "";

            /**
             * Parameter enumValues.
             * @member {Array.<string>} enumValues
             * @memberof flowspec.v1.Parameter
             * @instance
             */
            Parameter.prototype.enumValues = $util.emptyArray;

            /**
             * Parameter example.
             * @member {string} example
             * @memberof flowspec.v1.Parameter
             * @instance
             */
            Parameter.prototype.example = "";

            /**
             * Encodes the specified Parameter message. Does not implicitly {@link flowspec.v1.Parameter.verify|verify} messages.
             * @function encode
             * @memberof flowspec.v1.Parameter
             * @static
             * @param {flowspec.v1.IParameter} message Parameter message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Parameter.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.type != null && Object.hasOwnProperty.call(message, "type"))
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.type);
                if (message.required != null && Object.hasOwnProperty.call(message, "required"))
                    writer.uint32(/* id 2, wireType 0 =*/16).bool(message.required);
                if (message.defaultValue != null && Object.hasOwnProperty.call(message, "defaultValue"))
                    writer.uint32(/* id 3, wireType 2 =*/26).string(message.defaultValue);
                if (message.enumValues != null && message.enumValues.length)
                    for (let i = 0; i < message.enumValues.length; ++i)
                        writer.uint32(/* id 4, wireType 2 =*/34).string(message.enumValues[i]);
                if (message.example != null && Object.hasOwnProperty.call(message, "example"))
                    writer.uint32(/* id 5, wireType 2 =*/42).string(message.example);
                return writer;
            };

            /**
             * Decodes a Parameter message from the specified reader or buffer.
             * @function decode
             * @memberof flowspec.v1.Parameter
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {flowspec.v1.Parameter} Parameter
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Parameter.decode = function decode(reader, length) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                let end = length === undefined ? reader.len : reader.pos + length, message = new $root.flowspec.v1.Parameter();
                while (reader.pos < end) {
                    let tag = reader.uint32();
                    switch (tag >>> 3) {
                    case 1: {
                            message.type = reader.string();
                            break;
                        }
                    case 2: {
                            message.required = reader.bool();
                            break;
                        }
                    case 3: {
                            message.defaultValue = reader.string();
                            break;
                        }
                    case 4: {
                            if (!(message.enumValues && message.enumValues.length))
                                message.enumValues = [];
                            message.enumValues.push(reader.string());
                            break;
                        }
                    case 5: {
                            message.example = reader.string();
                            break;
                        }
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Gets the default type url for Parameter
             * @function getTypeUrl
             * @memberof flowspec.v1.Parameter
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            Parameter.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/flowspec.v1.Parameter";
            };

            return Parameter;
        })();

        v1.Role = (function() {

            /**
             * Properties of a Role.
             * @memberof flowspec.v1
             * @interface IRole
             * @property {string|null} [id] Role id
             * @property {string|null} [kind] Role kind
             * @property {string|null} [uid] Role uid
             * @property {string|null} [desc] Role desc
             */

            /**
             * Constructs a new Role.
             * @memberof flowspec.v1
             * @classdesc Represents a Role.
             * @implements IRole
             * @constructor
             * @param {flowspec.v1.IRole=} [properties] Properties to set
             */
            function Role(properties) {
                if (properties)
                    for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * Role id.
             * @member {string} id
             * @memberof flowspec.v1.Role
             * @instance
             */
            Role.prototype.id = "";

            /**
             * Role kind.
             * @member {string} kind
             * @memberof flowspec.v1.Role
             * @instance
             */
            Role.prototype.kind = "";

            /**
             * Role uid.
             * @member {string} uid
             * @memberof flowspec.v1.Role
             * @instance
             */
            Role.prototype.uid = "";

            /**
             * Role desc.
             * @member {string} desc
             * @memberof flowspec.v1.Role
             * @instance
             */
            Role.prototype.desc = "";

            /**
             * Encodes the specified Role message. Does not implicitly {@link flowspec.v1.Role.verify|verify} messages.
             * @function encode
             * @memberof flowspec.v1.Role
             * @static
             * @param {flowspec.v1.IRole} message Role message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Role.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.id != null && Object.hasOwnProperty.call(message, "id"))
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.id);
                if (message.kind != null && Object.hasOwnProperty.call(message, "kind"))
                    writer.uint32(/* id 2, wireType 2 =*/18).string(message.kind);
                if (message.uid != null && Object.hasOwnProperty.call(message, "uid"))
                    writer.uint32(/* id 3, wireType 2 =*/26).string(message.uid);
                if (message.desc != null && Object.hasOwnProperty.call(message, "desc"))
                    writer.uint32(/* id 4, wireType 2 =*/34).string(message.desc);
                return writer;
            };

            /**
             * Decodes a Role message from the specified reader or buffer.
             * @function decode
             * @memberof flowspec.v1.Role
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {flowspec.v1.Role} Role
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Role.decode = function decode(reader, length) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                let end = length === undefined ? reader.len : reader.pos + length, message = new $root.flowspec.v1.Role();
                while (reader.pos < end) {
                    let tag = reader.uint32();
                    switch (tag >>> 3) {
                    case 1: {
                            message.id = reader.string();
                            break;
                        }
                    case 2: {
                            message.kind = reader.string();
                            break;
                        }
                    case 3: {
                            message.uid = reader.string();
                            break;
                        }
                    case 4: {
                            message.desc = reader.string();
                            break;
                        }
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Gets the default type url for Role
             * @function getTypeUrl
             * @memberof flowspec.v1.Role
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            Role.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/flowspec.v1.Role";
            };

            return Role;
        })();

        v1.Artifacts = (function() {

            /**
             * Properties of an Artifacts.
             * @memberof flowspec.v1
             * @interface IArtifacts
             * @property {Array.<string>|null} [inputs] Artifacts inputs
             * @property {Array.<string>|null} [outputs] Artifacts outputs
             * @property {Array.<string>|null} [scratch] Artifacts scratch
             */

            /**
             * Constructs a new Artifacts.
             * @memberof flowspec.v1
             * @classdesc Represents an Artifacts.
             * @implements IArtifacts
             * @constructor
             * @param {flowspec.v1.IArtifacts=} [properties] Properties to set
             */
            function Artifacts(properties) {
                this.inputs = [];
                this.outputs = [];
                this.scratch = [];
                if (properties)
                    for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * Artifacts inputs.
             * @member {Array.<string>} inputs
             * @memberof flowspec.v1.Artifacts
             * @instance
             */
            Artifacts.prototype.inputs = $util.emptyArray;

            /**
             * Artifacts outputs.
             * @member {Array.<string>} outputs
             * @memberof flowspec.v1.Artifacts
             * @instance
             */
            Artifacts.prototype.outputs = $util.emptyArray;

            /**
             * Artifacts scratch.
             * @member {Array.<string>} scratch
             * @memberof flowspec.v1.Artifacts
             * @instance
             */
            Artifacts.prototype.scratch = $util.emptyArray;

            /**
             * Encodes the specified Artifacts message. Does not implicitly {@link flowspec.v1.Artifacts.verify|verify} messages.
             * @function encode
             * @memberof flowspec.v1.Artifacts
             * @static
             * @param {flowspec.v1.IArtifacts} message Artifacts message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Artifacts.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.inputs != null && message.inputs.length)
                    for (let i = 0; i < message.inputs.length; ++i)
                        writer.uint32(/* id 1, wireType 2 =*/10).string(message.inputs[i]);
                if (message.outputs != null && message.outputs.length)
                    for (let i = 0; i < message.outputs.length; ++i)
                        writer.uint32(/* id 2, wireType 2 =*/18).string(message.outputs[i]);
                if (message.scratch != null && message.scratch.length)
                    for (let i = 0; i < message.scratch.length; ++i)
                        writer.uint32(/* id 3, wireType 2 =*/26).string(message.scratch[i]);
                return writer;
            };

            /**
             * Decodes an Artifacts message from the specified reader or buffer.
             * @function decode
             * @memberof flowspec.v1.Artifacts
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {flowspec.v1.Artifacts} Artifacts
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Artifacts.decode = function decode(reader, length) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                let end = length === undefined ? reader.len : reader.pos + length, message = new $root.flowspec.v1.Artifacts();
                while (reader.pos < end) {
                    let tag = reader.uint32();
                    switch (tag >>> 3) {
                    case 1: {
                            if (!(message.inputs && message.inputs.length))
                                message.inputs = [];
                            message.inputs.push(reader.string());
                            break;
                        }
                    case 2: {
                            if (!(message.outputs && message.outputs.length))
                                message.outputs = [];
                            message.outputs.push(reader.string());
                            break;
                        }
                    case 3: {
                            if (!(message.scratch && message.scratch.length))
                                message.scratch = [];
                            message.scratch.push(reader.string());
                            break;
                        }
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Gets the default type url for Artifacts
             * @function getTypeUrl
             * @memberof flowspec.v1.Artifacts
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            Artifacts.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/flowspec.v1.Artifacts";
            };

            return Artifacts;
        })();

        v1.Events = (function() {

            /**
             * Properties of an Events.
             * @memberof flowspec.v1
             * @interface IEvents
             * @property {string|null} [stream] Events stream
             * @property {Array.<string>|null} [types] Events types
             */

            /**
             * Constructs a new Events.
             * @memberof flowspec.v1
             * @classdesc Represents an Events.
             * @implements IEvents
             * @constructor
             * @param {flowspec.v1.IEvents=} [properties] Properties to set
             */
            function Events(properties) {
                this.types = [];
                if (properties)
                    for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * Events stream.
             * @member {string} stream
             * @memberof flowspec.v1.Events
             * @instance
             */
            Events.prototype.stream = "";

            /**
             * Events types.
             * @member {Array.<string>} types
             * @memberof flowspec.v1.Events
             * @instance
             */
            Events.prototype.types = $util.emptyArray;

            /**
             * Encodes the specified Events message. Does not implicitly {@link flowspec.v1.Events.verify|verify} messages.
             * @function encode
             * @memberof flowspec.v1.Events
             * @static
             * @param {flowspec.v1.IEvents} message Events message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Events.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.stream != null && Object.hasOwnProperty.call(message, "stream"))
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.stream);
                if (message.types != null && message.types.length)
                    for (let i = 0; i < message.types.length; ++i)
                        writer.uint32(/* id 2, wireType 2 =*/18).string(message.types[i]);
                return writer;
            };

            /**
             * Decodes an Events message from the specified reader or buffer.
             * @function decode
             * @memberof flowspec.v1.Events
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {flowspec.v1.Events} Events
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Events.decode = function decode(reader, length) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                let end = length === undefined ? reader.len : reader.pos + length, message = new $root.flowspec.v1.Events();
                while (reader.pos < end) {
                    let tag = reader.uint32();
                    switch (tag >>> 3) {
                    case 1: {
                            message.stream = reader.string();
                            break;
                        }
                    case 2: {
                            if (!(message.types && message.types.length))
                                message.types = [];
                            message.types.push(reader.string());
                            break;
                        }
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Gets the default type url for Events
             * @function getTypeUrl
             * @memberof flowspec.v1.Events
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            Events.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/flowspec.v1.Events";
            };

            return Events;
        })();

        v1.Step = (function() {

            /**
             * Properties of a Step.
             * @memberof flowspec.v1
             * @interface IStep
             * @property {string|null} [id] Step id
             * @property {string|null} [title] Step title
             * @property {string|null} [desc] Step desc
             * @property {string|null} [role] Step role
             * @property {string|null} [when] Step when
             * @property {flowspec.v1.IToken|null} [token] Step token
             * @property {Array.<string>|null} [instructions] Step instructions
             * @property {flowspec.v1.IPrompts|null} [prompts] Step prompts
             * @property {flowspec.v1.IAcceptance|null} [acceptance] Step acceptance
             * @property {Array.<string>|null} [emitEvents] Step emitEvents
             * @property {Object.<string,string>|null} [metrics] Step metrics
             * @property {Array.<flowspec.v1.INextStep>|null} [next] Step next
             * @property {number|null} [timeoutMs] Step timeoutMs
             * @property {number|null} [maxAttempts] Step maxAttempts
             */

            /**
             * Constructs a new Step.
             * @memberof flowspec.v1
             * @classdesc Represents a Step.
             * @implements IStep
             * @constructor
             * @param {flowspec.v1.IStep=} [properties] Properties to set
             */
            function Step(properties) {
                this.instructions = [];
                this.emitEvents = [];
                this.metrics = {};
                this.next = [];
                if (properties)
                    for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * Step id.
             * @member {string} id
             * @memberof flowspec.v1.Step
             * @instance
             */
            Step.prototype.id = "";

            /**
             * Step title.
             * @member {string} title
             * @memberof flowspec.v1.Step
             * @instance
             */
            Step.prototype.title = "";

            /**
             * Step desc.
             * @member {string} desc
             * @memberof flowspec.v1.Step
             * @instance
             */
            Step.prototype.desc = "";

            /**
             * Step role.
             * @member {string} role
             * @memberof flowspec.v1.Step
             * @instance
             */
            Step.prototype.role = "";

            /**
             * Step when.
             * @member {string} when
             * @memberof flowspec.v1.Step
             * @instance
             */
            Step.prototype.when = "";

            /**
             * Step token.
             * @member {flowspec.v1.IToken|null|undefined} token
             * @memberof flowspec.v1.Step
             * @instance
             */
            Step.prototype.token = null;

            /**
             * Step instructions.
             * @member {Array.<string>} instructions
             * @memberof flowspec.v1.Step
             * @instance
             */
            Step.prototype.instructions = $util.emptyArray;

            /**
             * Step prompts.
             * @member {flowspec.v1.IPrompts|null|undefined} prompts
             * @memberof flowspec.v1.Step
             * @instance
             */
            Step.prototype.prompts = null;

            /**
             * Step acceptance.
             * @member {flowspec.v1.IAcceptance|null|undefined} acceptance
             * @memberof flowspec.v1.Step
             * @instance
             */
            Step.prototype.acceptance = null;

            /**
             * Step emitEvents.
             * @member {Array.<string>} emitEvents
             * @memberof flowspec.v1.Step
             * @instance
             */
            Step.prototype.emitEvents = $util.emptyArray;

            /**
             * Step metrics.
             * @member {Object.<string,string>} metrics
             * @memberof flowspec.v1.Step
             * @instance
             */
            Step.prototype.metrics = $util.emptyObject;

            /**
             * Step next.
             * @member {Array.<flowspec.v1.INextStep>} next
             * @memberof flowspec.v1.Step
             * @instance
             */
            Step.prototype.next = $util.emptyArray;

            /**
             * Step timeoutMs.
             * @member {number} timeoutMs
             * @memberof flowspec.v1.Step
             * @instance
             */
            Step.prototype.timeoutMs = 0;

            /**
             * Step maxAttempts.
             * @member {number} maxAttempts
             * @memberof flowspec.v1.Step
             * @instance
             */
            Step.prototype.maxAttempts = 0;

            /**
             * Encodes the specified Step message. Does not implicitly {@link flowspec.v1.Step.verify|verify} messages.
             * @function encode
             * @memberof flowspec.v1.Step
             * @static
             * @param {flowspec.v1.IStep} message Step message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Step.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.id != null && Object.hasOwnProperty.call(message, "id"))
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.id);
                if (message.title != null && Object.hasOwnProperty.call(message, "title"))
                    writer.uint32(/* id 2, wireType 2 =*/18).string(message.title);
                if (message.desc != null && Object.hasOwnProperty.call(message, "desc"))
                    writer.uint32(/* id 3, wireType 2 =*/26).string(message.desc);
                if (message.role != null && Object.hasOwnProperty.call(message, "role"))
                    writer.uint32(/* id 4, wireType 2 =*/34).string(message.role);
                if (message.when != null && Object.hasOwnProperty.call(message, "when"))
                    writer.uint32(/* id 5, wireType 2 =*/42).string(message.when);
                if (message.token != null && Object.hasOwnProperty.call(message, "token"))
                    $root.flowspec.v1.Token.encode(message.token, writer.uint32(/* id 6, wireType 2 =*/50).fork()).ldelim();
                if (message.instructions != null && message.instructions.length)
                    for (let i = 0; i < message.instructions.length; ++i)
                        writer.uint32(/* id 7, wireType 2 =*/58).string(message.instructions[i]);
                if (message.prompts != null && Object.hasOwnProperty.call(message, "prompts"))
                    $root.flowspec.v1.Prompts.encode(message.prompts, writer.uint32(/* id 8, wireType 2 =*/66).fork()).ldelim();
                if (message.acceptance != null && Object.hasOwnProperty.call(message, "acceptance"))
                    $root.flowspec.v1.Acceptance.encode(message.acceptance, writer.uint32(/* id 9, wireType 2 =*/74).fork()).ldelim();
                if (message.emitEvents != null && message.emitEvents.length)
                    for (let i = 0; i < message.emitEvents.length; ++i)
                        writer.uint32(/* id 10, wireType 2 =*/82).string(message.emitEvents[i]);
                if (message.metrics != null && Object.hasOwnProperty.call(message, "metrics"))
                    for (let keys = Object.keys(message.metrics), i = 0; i < keys.length; ++i)
                        writer.uint32(/* id 11, wireType 2 =*/90).fork().uint32(/* id 1, wireType 2 =*/10).string(keys[i]).uint32(/* id 2, wireType 2 =*/18).string(message.metrics[keys[i]]).ldelim();
                if (message.next != null && message.next.length)
                    for (let i = 0; i < message.next.length; ++i)
                        $root.flowspec.v1.NextStep.encode(message.next[i], writer.uint32(/* id 12, wireType 2 =*/98).fork()).ldelim();
                if (message.timeoutMs != null && Object.hasOwnProperty.call(message, "timeoutMs"))
                    writer.uint32(/* id 13, wireType 0 =*/104).int32(message.timeoutMs);
                if (message.maxAttempts != null && Object.hasOwnProperty.call(message, "maxAttempts"))
                    writer.uint32(/* id 14, wireType 0 =*/112).int32(message.maxAttempts);
                return writer;
            };

            /**
             * Decodes a Step message from the specified reader or buffer.
             * @function decode
             * @memberof flowspec.v1.Step
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {flowspec.v1.Step} Step
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Step.decode = function decode(reader, length) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                let end = length === undefined ? reader.len : reader.pos + length, message = new $root.flowspec.v1.Step(), key, value;
                while (reader.pos < end) {
                    let tag = reader.uint32();
                    switch (tag >>> 3) {
                    case 1: {
                            message.id = reader.string();
                            break;
                        }
                    case 2: {
                            message.title = reader.string();
                            break;
                        }
                    case 3: {
                            message.desc = reader.string();
                            break;
                        }
                    case 4: {
                            message.role = reader.string();
                            break;
                        }
                    case 5: {
                            message.when = reader.string();
                            break;
                        }
                    case 6: {
                            message.token = $root.flowspec.v1.Token.decode(reader, reader.uint32());
                            break;
                        }
                    case 7: {
                            if (!(message.instructions && message.instructions.length))
                                message.instructions = [];
                            message.instructions.push(reader.string());
                            break;
                        }
                    case 8: {
                            message.prompts = $root.flowspec.v1.Prompts.decode(reader, reader.uint32());
                            break;
                        }
                    case 9: {
                            message.acceptance = $root.flowspec.v1.Acceptance.decode(reader, reader.uint32());
                            break;
                        }
                    case 10: {
                            if (!(message.emitEvents && message.emitEvents.length))
                                message.emitEvents = [];
                            message.emitEvents.push(reader.string());
                            break;
                        }
                    case 11: {
                            if (message.metrics === $util.emptyObject)
                                message.metrics = {};
                            let end2 = reader.uint32() + reader.pos;
                            key = "";
                            value = "";
                            while (reader.pos < end2) {
                                let tag2 = reader.uint32();
                                switch (tag2 >>> 3) {
                                case 1:
                                    key = reader.string();
                                    break;
                                case 2:
                                    value = reader.string();
                                    break;
                                default:
                                    reader.skipType(tag2 & 7);
                                    break;
                                }
                            }
                            message.metrics[key] = value;
                            break;
                        }
                    case 12: {
                            if (!(message.next && message.next.length))
                                message.next = [];
                            message.next.push($root.flowspec.v1.NextStep.decode(reader, reader.uint32()));
                            break;
                        }
                    case 13: {
                            message.timeoutMs = reader.int32();
                            break;
                        }
                    case 14: {
                            message.maxAttempts = reader.int32();
                            break;
                        }
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Gets the default type url for Step
             * @function getTypeUrl
             * @memberof flowspec.v1.Step
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            Step.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/flowspec.v1.Step";
            };

            return Step;
        })();

        v1.Token = (function() {

            /**
             * Properties of a Token.
             * @memberof flowspec.v1
             * @interface IToken
             * @property {boolean|null} [advisory] Token advisory
             * @property {flowspec.v1.ITokenScope|null} [scope] Token scope
             * @property {flowspec.v1.ITokenClaims|null} [claims] Token claims
             */

            /**
             * Constructs a new Token.
             * @memberof flowspec.v1
             * @classdesc Represents a Token.
             * @implements IToken
             * @constructor
             * @param {flowspec.v1.IToken=} [properties] Properties to set
             */
            function Token(properties) {
                if (properties)
                    for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * Token advisory.
             * @member {boolean} advisory
             * @memberof flowspec.v1.Token
             * @instance
             */
            Token.prototype.advisory = false;

            /**
             * Token scope.
             * @member {flowspec.v1.ITokenScope|null|undefined} scope
             * @memberof flowspec.v1.Token
             * @instance
             */
            Token.prototype.scope = null;

            /**
             * Token claims.
             * @member {flowspec.v1.ITokenClaims|null|undefined} claims
             * @memberof flowspec.v1.Token
             * @instance
             */
            Token.prototype.claims = null;

            /**
             * Encodes the specified Token message. Does not implicitly {@link flowspec.v1.Token.verify|verify} messages.
             * @function encode
             * @memberof flowspec.v1.Token
             * @static
             * @param {flowspec.v1.IToken} message Token message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Token.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.advisory != null && Object.hasOwnProperty.call(message, "advisory"))
                    writer.uint32(/* id 1, wireType 0 =*/8).bool(message.advisory);
                if (message.scope != null && Object.hasOwnProperty.call(message, "scope"))
                    $root.flowspec.v1.TokenScope.encode(message.scope, writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim();
                if (message.claims != null && Object.hasOwnProperty.call(message, "claims"))
                    $root.flowspec.v1.TokenClaims.encode(message.claims, writer.uint32(/* id 3, wireType 2 =*/26).fork()).ldelim();
                return writer;
            };

            /**
             * Decodes a Token message from the specified reader or buffer.
             * @function decode
             * @memberof flowspec.v1.Token
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {flowspec.v1.Token} Token
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Token.decode = function decode(reader, length) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                let end = length === undefined ? reader.len : reader.pos + length, message = new $root.flowspec.v1.Token();
                while (reader.pos < end) {
                    let tag = reader.uint32();
                    switch (tag >>> 3) {
                    case 1: {
                            message.advisory = reader.bool();
                            break;
                        }
                    case 2: {
                            message.scope = $root.flowspec.v1.TokenScope.decode(reader, reader.uint32());
                            break;
                        }
                    case 3: {
                            message.claims = $root.flowspec.v1.TokenClaims.decode(reader, reader.uint32());
                            break;
                        }
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Gets the default type url for Token
             * @function getTypeUrl
             * @memberof flowspec.v1.Token
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            Token.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/flowspec.v1.Token";
            };

            return Token;
        })();

        v1.TokenScope = (function() {

            /**
             * Properties of a TokenScope.
             * @memberof flowspec.v1
             * @interface ITokenScope
             * @property {Array.<string>|null} [fsRead] TokenScope fsRead
             * @property {Array.<string>|null} [fsWrite] TokenScope fsWrite
             * @property {string|null} [net] TokenScope net
             * @property {Array.<string>|null} [exec] TokenScope exec
             * @property {Array.<string>|null} [secrets] TokenScope secrets
             * @property {number|null} [leaseMs] TokenScope leaseMs
             */

            /**
             * Constructs a new TokenScope.
             * @memberof flowspec.v1
             * @classdesc Represents a TokenScope.
             * @implements ITokenScope
             * @constructor
             * @param {flowspec.v1.ITokenScope=} [properties] Properties to set
             */
            function TokenScope(properties) {
                this.fsRead = [];
                this.fsWrite = [];
                this.exec = [];
                this.secrets = [];
                if (properties)
                    for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * TokenScope fsRead.
             * @member {Array.<string>} fsRead
             * @memberof flowspec.v1.TokenScope
             * @instance
             */
            TokenScope.prototype.fsRead = $util.emptyArray;

            /**
             * TokenScope fsWrite.
             * @member {Array.<string>} fsWrite
             * @memberof flowspec.v1.TokenScope
             * @instance
             */
            TokenScope.prototype.fsWrite = $util.emptyArray;

            /**
             * TokenScope net.
             * @member {string} net
             * @memberof flowspec.v1.TokenScope
             * @instance
             */
            TokenScope.prototype.net = "";

            /**
             * TokenScope exec.
             * @member {Array.<string>} exec
             * @memberof flowspec.v1.TokenScope
             * @instance
             */
            TokenScope.prototype.exec = $util.emptyArray;

            /**
             * TokenScope secrets.
             * @member {Array.<string>} secrets
             * @memberof flowspec.v1.TokenScope
             * @instance
             */
            TokenScope.prototype.secrets = $util.emptyArray;

            /**
             * TokenScope leaseMs.
             * @member {number} leaseMs
             * @memberof flowspec.v1.TokenScope
             * @instance
             */
            TokenScope.prototype.leaseMs = 0;

            /**
             * Encodes the specified TokenScope message. Does not implicitly {@link flowspec.v1.TokenScope.verify|verify} messages.
             * @function encode
             * @memberof flowspec.v1.TokenScope
             * @static
             * @param {flowspec.v1.ITokenScope} message TokenScope message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            TokenScope.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.fsRead != null && message.fsRead.length)
                    for (let i = 0; i < message.fsRead.length; ++i)
                        writer.uint32(/* id 1, wireType 2 =*/10).string(message.fsRead[i]);
                if (message.fsWrite != null && message.fsWrite.length)
                    for (let i = 0; i < message.fsWrite.length; ++i)
                        writer.uint32(/* id 2, wireType 2 =*/18).string(message.fsWrite[i]);
                if (message.net != null && Object.hasOwnProperty.call(message, "net"))
                    writer.uint32(/* id 3, wireType 2 =*/26).string(message.net);
                if (message.exec != null && message.exec.length)
                    for (let i = 0; i < message.exec.length; ++i)
                        writer.uint32(/* id 4, wireType 2 =*/34).string(message.exec[i]);
                if (message.secrets != null && message.secrets.length)
                    for (let i = 0; i < message.secrets.length; ++i)
                        writer.uint32(/* id 5, wireType 2 =*/42).string(message.secrets[i]);
                if (message.leaseMs != null && Object.hasOwnProperty.call(message, "leaseMs"))
                    writer.uint32(/* id 6, wireType 0 =*/48).int32(message.leaseMs);
                return writer;
            };

            /**
             * Decodes a TokenScope message from the specified reader or buffer.
             * @function decode
             * @memberof flowspec.v1.TokenScope
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {flowspec.v1.TokenScope} TokenScope
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            TokenScope.decode = function decode(reader, length) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                let end = length === undefined ? reader.len : reader.pos + length, message = new $root.flowspec.v1.TokenScope();
                while (reader.pos < end) {
                    let tag = reader.uint32();
                    switch (tag >>> 3) {
                    case 1: {
                            if (!(message.fsRead && message.fsRead.length))
                                message.fsRead = [];
                            message.fsRead.push(reader.string());
                            break;
                        }
                    case 2: {
                            if (!(message.fsWrite && message.fsWrite.length))
                                message.fsWrite = [];
                            message.fsWrite.push(reader.string());
                            break;
                        }
                    case 3: {
                            message.net = reader.string();
                            break;
                        }
                    case 4: {
                            if (!(message.exec && message.exec.length))
                                message.exec = [];
                            message.exec.push(reader.string());
                            break;
                        }
                    case 5: {
                            if (!(message.secrets && message.secrets.length))
                                message.secrets = [];
                            message.secrets.push(reader.string());
                            break;
                        }
                    case 6: {
                            message.leaseMs = reader.int32();
                            break;
                        }
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Gets the default type url for TokenScope
             * @function getTypeUrl
             * @memberof flowspec.v1.TokenScope
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            TokenScope.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/flowspec.v1.TokenScope";
            };

            return TokenScope;
        })();

        v1.TokenClaims = (function() {

            /**
             * Properties of a TokenClaims.
             * @memberof flowspec.v1
             * @interface ITokenClaims
             * @property {string|null} [aud] TokenClaims aud
             * @property {string|null} [sub] TokenClaims sub
             * @property {string|null} [nonce] TokenClaims nonce
             */

            /**
             * Constructs a new TokenClaims.
             * @memberof flowspec.v1
             * @classdesc Represents a TokenClaims.
             * @implements ITokenClaims
             * @constructor
             * @param {flowspec.v1.ITokenClaims=} [properties] Properties to set
             */
            function TokenClaims(properties) {
                if (properties)
                    for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * TokenClaims aud.
             * @member {string} aud
             * @memberof flowspec.v1.TokenClaims
             * @instance
             */
            TokenClaims.prototype.aud = "";

            /**
             * TokenClaims sub.
             * @member {string} sub
             * @memberof flowspec.v1.TokenClaims
             * @instance
             */
            TokenClaims.prototype.sub = "";

            /**
             * TokenClaims nonce.
             * @member {string} nonce
             * @memberof flowspec.v1.TokenClaims
             * @instance
             */
            TokenClaims.prototype.nonce = "";

            /**
             * Encodes the specified TokenClaims message. Does not implicitly {@link flowspec.v1.TokenClaims.verify|verify} messages.
             * @function encode
             * @memberof flowspec.v1.TokenClaims
             * @static
             * @param {flowspec.v1.ITokenClaims} message TokenClaims message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            TokenClaims.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.aud != null && Object.hasOwnProperty.call(message, "aud"))
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.aud);
                if (message.sub != null && Object.hasOwnProperty.call(message, "sub"))
                    writer.uint32(/* id 2, wireType 2 =*/18).string(message.sub);
                if (message.nonce != null && Object.hasOwnProperty.call(message, "nonce"))
                    writer.uint32(/* id 3, wireType 2 =*/26).string(message.nonce);
                return writer;
            };

            /**
             * Decodes a TokenClaims message from the specified reader or buffer.
             * @function decode
             * @memberof flowspec.v1.TokenClaims
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {flowspec.v1.TokenClaims} TokenClaims
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            TokenClaims.decode = function decode(reader, length) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                let end = length === undefined ? reader.len : reader.pos + length, message = new $root.flowspec.v1.TokenClaims();
                while (reader.pos < end) {
                    let tag = reader.uint32();
                    switch (tag >>> 3) {
                    case 1: {
                            message.aud = reader.string();
                            break;
                        }
                    case 2: {
                            message.sub = reader.string();
                            break;
                        }
                    case 3: {
                            message.nonce = reader.string();
                            break;
                        }
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Gets the default type url for TokenClaims
             * @function getTypeUrl
             * @memberof flowspec.v1.TokenClaims
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            TokenClaims.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/flowspec.v1.TokenClaims";
            };

            return TokenClaims;
        })();

        v1.Prompts = (function() {

            /**
             * Properties of a Prompts.
             * @memberof flowspec.v1
             * @interface IPrompts
             * @property {string|null} [system] Prompts system
             * @property {string|null} [user] Prompts user
             * @property {string|null} [notes] Prompts notes
             */

            /**
             * Constructs a new Prompts.
             * @memberof flowspec.v1
             * @classdesc Represents a Prompts.
             * @implements IPrompts
             * @constructor
             * @param {flowspec.v1.IPrompts=} [properties] Properties to set
             */
            function Prompts(properties) {
                if (properties)
                    for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * Prompts system.
             * @member {string} system
             * @memberof flowspec.v1.Prompts
             * @instance
             */
            Prompts.prototype.system = "";

            /**
             * Prompts user.
             * @member {string} user
             * @memberof flowspec.v1.Prompts
             * @instance
             */
            Prompts.prototype.user = "";

            /**
             * Prompts notes.
             * @member {string} notes
             * @memberof flowspec.v1.Prompts
             * @instance
             */
            Prompts.prototype.notes = "";

            /**
             * Encodes the specified Prompts message. Does not implicitly {@link flowspec.v1.Prompts.verify|verify} messages.
             * @function encode
             * @memberof flowspec.v1.Prompts
             * @static
             * @param {flowspec.v1.IPrompts} message Prompts message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Prompts.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.system != null && Object.hasOwnProperty.call(message, "system"))
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.system);
                if (message.user != null && Object.hasOwnProperty.call(message, "user"))
                    writer.uint32(/* id 2, wireType 2 =*/18).string(message.user);
                if (message.notes != null && Object.hasOwnProperty.call(message, "notes"))
                    writer.uint32(/* id 3, wireType 2 =*/26).string(message.notes);
                return writer;
            };

            /**
             * Decodes a Prompts message from the specified reader or buffer.
             * @function decode
             * @memberof flowspec.v1.Prompts
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {flowspec.v1.Prompts} Prompts
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Prompts.decode = function decode(reader, length) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                let end = length === undefined ? reader.len : reader.pos + length, message = new $root.flowspec.v1.Prompts();
                while (reader.pos < end) {
                    let tag = reader.uint32();
                    switch (tag >>> 3) {
                    case 1: {
                            message.system = reader.string();
                            break;
                        }
                    case 2: {
                            message.user = reader.string();
                            break;
                        }
                    case 3: {
                            message.notes = reader.string();
                            break;
                        }
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Gets the default type url for Prompts
             * @function getTypeUrl
             * @memberof flowspec.v1.Prompts
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            Prompts.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/flowspec.v1.Prompts";
            };

            return Prompts;
        })();

        v1.Acceptance = (function() {

            /**
             * Properties of an Acceptance.
             * @memberof flowspec.v1
             * @interface IAcceptance
             * @property {Array.<flowspec.v1.ICheck>|null} [checks] Acceptance checks
             */

            /**
             * Constructs a new Acceptance.
             * @memberof flowspec.v1
             * @classdesc Represents an Acceptance.
             * @implements IAcceptance
             * @constructor
             * @param {flowspec.v1.IAcceptance=} [properties] Properties to set
             */
            function Acceptance(properties) {
                this.checks = [];
                if (properties)
                    for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * Acceptance checks.
             * @member {Array.<flowspec.v1.ICheck>} checks
             * @memberof flowspec.v1.Acceptance
             * @instance
             */
            Acceptance.prototype.checks = $util.emptyArray;

            /**
             * Encodes the specified Acceptance message. Does not implicitly {@link flowspec.v1.Acceptance.verify|verify} messages.
             * @function encode
             * @memberof flowspec.v1.Acceptance
             * @static
             * @param {flowspec.v1.IAcceptance} message Acceptance message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Acceptance.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.checks != null && message.checks.length)
                    for (let i = 0; i < message.checks.length; ++i)
                        $root.flowspec.v1.Check.encode(message.checks[i], writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
                return writer;
            };

            /**
             * Decodes an Acceptance message from the specified reader or buffer.
             * @function decode
             * @memberof flowspec.v1.Acceptance
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {flowspec.v1.Acceptance} Acceptance
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Acceptance.decode = function decode(reader, length) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                let end = length === undefined ? reader.len : reader.pos + length, message = new $root.flowspec.v1.Acceptance();
                while (reader.pos < end) {
                    let tag = reader.uint32();
                    switch (tag >>> 3) {
                    case 1: {
                            if (!(message.checks && message.checks.length))
                                message.checks = [];
                            message.checks.push($root.flowspec.v1.Check.decode(reader, reader.uint32()));
                            break;
                        }
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Gets the default type url for Acceptance
             * @function getTypeUrl
             * @memberof flowspec.v1.Acceptance
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            Acceptance.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/flowspec.v1.Acceptance";
            };

            return Acceptance;
        })();

        v1.Check = (function() {

            /**
             * Properties of a Check.
             * @memberof flowspec.v1
             * @interface ICheck
             * @property {string|null} [kind] Check kind
             * @property {string|null} [path] Check path
             * @property {string|null} [file] Check file
             * @property {Array.<string>|null} [keys] Check keys
             * @property {Array.<string>|null} [allowed] Check allowed
             * @property {number|null} [min] Check min
             * @property {string|null} [expr] Check expr
             * @property {string|null} [schema] Check schema
             * @property {string|null} [onFail] Check onFail
             * @property {string|null} [severity] Check severity
             */

            /**
             * Constructs a new Check.
             * @memberof flowspec.v1
             * @classdesc Represents a Check.
             * @implements ICheck
             * @constructor
             * @param {flowspec.v1.ICheck=} [properties] Properties to set
             */
            function Check(properties) {
                this.keys = [];
                this.allowed = [];
                if (properties)
                    for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * Check kind.
             * @member {string} kind
             * @memberof flowspec.v1.Check
             * @instance
             */
            Check.prototype.kind = "";

            /**
             * Check path.
             * @member {string} path
             * @memberof flowspec.v1.Check
             * @instance
             */
            Check.prototype.path = "";

            /**
             * Check file.
             * @member {string} file
             * @memberof flowspec.v1.Check
             * @instance
             */
            Check.prototype.file = "";

            /**
             * Check keys.
             * @member {Array.<string>} keys
             * @memberof flowspec.v1.Check
             * @instance
             */
            Check.prototype.keys = $util.emptyArray;

            /**
             * Check allowed.
             * @member {Array.<string>} allowed
             * @memberof flowspec.v1.Check
             * @instance
             */
            Check.prototype.allowed = $util.emptyArray;

            /**
             * Check min.
             * @member {number} min
             * @memberof flowspec.v1.Check
             * @instance
             */
            Check.prototype.min = 0;

            /**
             * Check expr.
             * @member {string} expr
             * @memberof flowspec.v1.Check
             * @instance
             */
            Check.prototype.expr = "";

            /**
             * Check schema.
             * @member {string} schema
             * @memberof flowspec.v1.Check
             * @instance
             */
            Check.prototype.schema = "";

            /**
             * Check onFail.
             * @member {string} onFail
             * @memberof flowspec.v1.Check
             * @instance
             */
            Check.prototype.onFail = "";

            /**
             * Check severity.
             * @member {string} severity
             * @memberof flowspec.v1.Check
             * @instance
             */
            Check.prototype.severity = "";

            /**
             * Encodes the specified Check message. Does not implicitly {@link flowspec.v1.Check.verify|verify} messages.
             * @function encode
             * @memberof flowspec.v1.Check
             * @static
             * @param {flowspec.v1.ICheck} message Check message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Check.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.kind != null && Object.hasOwnProperty.call(message, "kind"))
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.kind);
                if (message.path != null && Object.hasOwnProperty.call(message, "path"))
                    writer.uint32(/* id 2, wireType 2 =*/18).string(message.path);
                if (message.file != null && Object.hasOwnProperty.call(message, "file"))
                    writer.uint32(/* id 3, wireType 2 =*/26).string(message.file);
                if (message.keys != null && message.keys.length)
                    for (let i = 0; i < message.keys.length; ++i)
                        writer.uint32(/* id 4, wireType 2 =*/34).string(message.keys[i]);
                if (message.allowed != null && message.allowed.length)
                    for (let i = 0; i < message.allowed.length; ++i)
                        writer.uint32(/* id 5, wireType 2 =*/42).string(message.allowed[i]);
                if (message.min != null && Object.hasOwnProperty.call(message, "min"))
                    writer.uint32(/* id 6, wireType 0 =*/48).int32(message.min);
                if (message.expr != null && Object.hasOwnProperty.call(message, "expr"))
                    writer.uint32(/* id 7, wireType 2 =*/58).string(message.expr);
                if (message.schema != null && Object.hasOwnProperty.call(message, "schema"))
                    writer.uint32(/* id 8, wireType 2 =*/66).string(message.schema);
                if (message.onFail != null && Object.hasOwnProperty.call(message, "onFail"))
                    writer.uint32(/* id 9, wireType 2 =*/74).string(message.onFail);
                if (message.severity != null && Object.hasOwnProperty.call(message, "severity"))
                    writer.uint32(/* id 10, wireType 2 =*/82).string(message.severity);
                return writer;
            };

            /**
             * Decodes a Check message from the specified reader or buffer.
             * @function decode
             * @memberof flowspec.v1.Check
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {flowspec.v1.Check} Check
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Check.decode = function decode(reader, length) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                let end = length === undefined ? reader.len : reader.pos + length, message = new $root.flowspec.v1.Check();
                while (reader.pos < end) {
                    let tag = reader.uint32();
                    switch (tag >>> 3) {
                    case 1: {
                            message.kind = reader.string();
                            break;
                        }
                    case 2: {
                            message.path = reader.string();
                            break;
                        }
                    case 3: {
                            message.file = reader.string();
                            break;
                        }
                    case 4: {
                            if (!(message.keys && message.keys.length))
                                message.keys = [];
                            message.keys.push(reader.string());
                            break;
                        }
                    case 5: {
                            if (!(message.allowed && message.allowed.length))
                                message.allowed = [];
                            message.allowed.push(reader.string());
                            break;
                        }
                    case 6: {
                            message.min = reader.int32();
                            break;
                        }
                    case 7: {
                            message.expr = reader.string();
                            break;
                        }
                    case 8: {
                            message.schema = reader.string();
                            break;
                        }
                    case 9: {
                            message.onFail = reader.string();
                            break;
                        }
                    case 10: {
                            message.severity = reader.string();
                            break;
                        }
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Gets the default type url for Check
             * @function getTypeUrl
             * @memberof flowspec.v1.Check
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            Check.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/flowspec.v1.Check";
            };

            return Check;
        })();

        v1.NextStep = (function() {

            /**
             * Properties of a NextStep.
             * @memberof flowspec.v1
             * @interface INextStep
             * @property {string|null} [to] NextStep to
             * @property {string|null} [when] NextStep when
             */

            /**
             * Constructs a new NextStep.
             * @memberof flowspec.v1
             * @classdesc Represents a NextStep.
             * @implements INextStep
             * @constructor
             * @param {flowspec.v1.INextStep=} [properties] Properties to set
             */
            function NextStep(properties) {
                if (properties)
                    for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * NextStep to.
             * @member {string} to
             * @memberof flowspec.v1.NextStep
             * @instance
             */
            NextStep.prototype.to = "";

            /**
             * NextStep when.
             * @member {string} when
             * @memberof flowspec.v1.NextStep
             * @instance
             */
            NextStep.prototype.when = "";

            /**
             * Encodes the specified NextStep message. Does not implicitly {@link flowspec.v1.NextStep.verify|verify} messages.
             * @function encode
             * @memberof flowspec.v1.NextStep
             * @static
             * @param {flowspec.v1.INextStep} message NextStep message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            NextStep.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.to != null && Object.hasOwnProperty.call(message, "to"))
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.to);
                if (message.when != null && Object.hasOwnProperty.call(message, "when"))
                    writer.uint32(/* id 2, wireType 2 =*/18).string(message.when);
                return writer;
            };

            /**
             * Decodes a NextStep message from the specified reader or buffer.
             * @function decode
             * @memberof flowspec.v1.NextStep
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {flowspec.v1.NextStep} NextStep
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            NextStep.decode = function decode(reader, length) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                let end = length === undefined ? reader.len : reader.pos + length, message = new $root.flowspec.v1.NextStep();
                while (reader.pos < end) {
                    let tag = reader.uint32();
                    switch (tag >>> 3) {
                    case 1: {
                            message.to = reader.string();
                            break;
                        }
                    case 2: {
                            message.when = reader.string();
                            break;
                        }
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Gets the default type url for NextStep
             * @function getTypeUrl
             * @memberof flowspec.v1.NextStep
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            NextStep.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/flowspec.v1.NextStep";
            };

            return NextStep;
        })();

        return v1;
    })();

    return flowspec;
})();

export { $root as default };
