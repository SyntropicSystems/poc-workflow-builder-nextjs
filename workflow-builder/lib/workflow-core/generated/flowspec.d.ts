import * as $protobuf from "protobufjs";
import Long = require("long");
/** Namespace flowspec. */
export namespace flowspec {

    /** Namespace v1. */
    namespace v1 {

        /** Properties of a Flow. */
        interface IFlow {

            /** Flow schema */
            schema?: (string|null);

            /** Flow id */
            id?: (string|null);

            /** Flow title */
            title?: (string|null);

            /** Flow owner */
            owner?: (string|null);

            /** Flow labels */
            labels?: (string[]|null);

            /** Flow policy */
            policy?: (flowspec.v1.IPolicy|null);

            /** Flow context */
            context?: (flowspec.v1.IContext|null);

            /** Flow parameters */
            parameters?: ({ [k: string]: flowspec.v1.IParameter }|null);

            /** Flow roles */
            roles?: (flowspec.v1.IRole[]|null);

            /** Flow artifacts */
            artifacts?: (flowspec.v1.IArtifacts|null);

            /** Flow events */
            events?: (flowspec.v1.IEvents|null);

            /** Flow steps */
            steps?: (flowspec.v1.IStep[]|null);
        }

        /** Represents a Flow. */
        class Flow implements IFlow {

            /**
             * Constructs a new Flow.
             * @param [properties] Properties to set
             */
            constructor(properties?: flowspec.v1.IFlow);

            /** Flow schema. */
            public schema: string;

            /** Flow id. */
            public id: string;

            /** Flow title. */
            public title: string;

            /** Flow owner. */
            public owner: string;

            /** Flow labels. */
            public labels: string[];

            /** Flow policy. */
            public policy?: (flowspec.v1.IPolicy|null);

            /** Flow context. */
            public context?: (flowspec.v1.IContext|null);

            /** Flow parameters. */
            public parameters: { [k: string]: flowspec.v1.IParameter };

            /** Flow roles. */
            public roles: flowspec.v1.IRole[];

            /** Flow artifacts. */
            public artifacts?: (flowspec.v1.IArtifacts|null);

            /** Flow events. */
            public events?: (flowspec.v1.IEvents|null);

            /** Flow steps. */
            public steps: flowspec.v1.IStep[];

            /**
             * Encodes the specified Flow message. Does not implicitly {@link flowspec.v1.Flow.verify|verify} messages.
             * @param message Flow message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: flowspec.v1.IFlow, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a Flow message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns Flow
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): flowspec.v1.Flow;

            /**
             * Gets the default type url for Flow
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** Properties of a Policy. */
        interface IPolicy {

            /** Policy enforcement */
            enforcement?: (string|null);

            /** Policy tokensRequired */
            tokensRequired?: (boolean|null);

            /** Policy eventsRequired */
            eventsRequired?: (boolean|null);
        }

        /** Represents a Policy. */
        class Policy implements IPolicy {

            /**
             * Constructs a new Policy.
             * @param [properties] Properties to set
             */
            constructor(properties?: flowspec.v1.IPolicy);

            /** Policy enforcement. */
            public enforcement: string;

            /** Policy tokensRequired. */
            public tokensRequired: boolean;

            /** Policy eventsRequired. */
            public eventsRequired: boolean;

            /**
             * Encodes the specified Policy message. Does not implicitly {@link flowspec.v1.Policy.verify|verify} messages.
             * @param message Policy message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: flowspec.v1.IPolicy, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a Policy message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns Policy
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): flowspec.v1.Policy;

            /**
             * Gets the default type url for Policy
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** Properties of a Context. */
        interface IContext {

            /** Context domain */
            domain?: (string|null);

            /** Context brief */
            brief?: (string|null);

            /** Context links */
            links?: (string[]|null);
        }

        /** Represents a Context. */
        class Context implements IContext {

            /**
             * Constructs a new Context.
             * @param [properties] Properties to set
             */
            constructor(properties?: flowspec.v1.IContext);

            /** Context domain. */
            public domain: string;

            /** Context brief. */
            public brief: string;

            /** Context links. */
            public links: string[];

            /**
             * Encodes the specified Context message. Does not implicitly {@link flowspec.v1.Context.verify|verify} messages.
             * @param message Context message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: flowspec.v1.IContext, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a Context message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns Context
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): flowspec.v1.Context;

            /**
             * Gets the default type url for Context
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** Properties of a Parameter. */
        interface IParameter {

            /** Parameter type */
            type?: (string|null);

            /** Parameter required */
            required?: (boolean|null);

            /** Parameter defaultValue */
            defaultValue?: (string|null);

            /** Parameter enumValues */
            enumValues?: (string[]|null);

            /** Parameter example */
            example?: (string|null);
        }

        /** Represents a Parameter. */
        class Parameter implements IParameter {

            /**
             * Constructs a new Parameter.
             * @param [properties] Properties to set
             */
            constructor(properties?: flowspec.v1.IParameter);

            /** Parameter type. */
            public type: string;

            /** Parameter required. */
            public required: boolean;

            /** Parameter defaultValue. */
            public defaultValue: string;

            /** Parameter enumValues. */
            public enumValues: string[];

            /** Parameter example. */
            public example: string;

            /**
             * Encodes the specified Parameter message. Does not implicitly {@link flowspec.v1.Parameter.verify|verify} messages.
             * @param message Parameter message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: flowspec.v1.IParameter, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a Parameter message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns Parameter
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): flowspec.v1.Parameter;

            /**
             * Gets the default type url for Parameter
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** Properties of a Role. */
        interface IRole {

            /** Role id */
            id?: (string|null);

            /** Role kind */
            kind?: (string|null);

            /** Role uid */
            uid?: (string|null);

            /** Role desc */
            desc?: (string|null);
        }

        /** Represents a Role. */
        class Role implements IRole {

            /**
             * Constructs a new Role.
             * @param [properties] Properties to set
             */
            constructor(properties?: flowspec.v1.IRole);

            /** Role id. */
            public id: string;

            /** Role kind. */
            public kind: string;

            /** Role uid. */
            public uid: string;

            /** Role desc. */
            public desc: string;

            /**
             * Encodes the specified Role message. Does not implicitly {@link flowspec.v1.Role.verify|verify} messages.
             * @param message Role message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: flowspec.v1.IRole, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a Role message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns Role
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): flowspec.v1.Role;

            /**
             * Gets the default type url for Role
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** Properties of an Artifacts. */
        interface IArtifacts {

            /** Artifacts inputs */
            inputs?: (string[]|null);

            /** Artifacts outputs */
            outputs?: (string[]|null);

            /** Artifacts scratch */
            scratch?: (string[]|null);
        }

        /** Represents an Artifacts. */
        class Artifacts implements IArtifacts {

            /**
             * Constructs a new Artifacts.
             * @param [properties] Properties to set
             */
            constructor(properties?: flowspec.v1.IArtifacts);

            /** Artifacts inputs. */
            public inputs: string[];

            /** Artifacts outputs. */
            public outputs: string[];

            /** Artifacts scratch. */
            public scratch: string[];

            /**
             * Encodes the specified Artifacts message. Does not implicitly {@link flowspec.v1.Artifacts.verify|verify} messages.
             * @param message Artifacts message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: flowspec.v1.IArtifacts, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes an Artifacts message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns Artifacts
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): flowspec.v1.Artifacts;

            /**
             * Gets the default type url for Artifacts
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** Properties of an Events. */
        interface IEvents {

            /** Events stream */
            stream?: (string|null);

            /** Events types */
            types?: (string[]|null);
        }

        /** Represents an Events. */
        class Events implements IEvents {

            /**
             * Constructs a new Events.
             * @param [properties] Properties to set
             */
            constructor(properties?: flowspec.v1.IEvents);

            /** Events stream. */
            public stream: string;

            /** Events types. */
            public types: string[];

            /**
             * Encodes the specified Events message. Does not implicitly {@link flowspec.v1.Events.verify|verify} messages.
             * @param message Events message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: flowspec.v1.IEvents, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes an Events message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns Events
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): flowspec.v1.Events;

            /**
             * Gets the default type url for Events
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** Properties of a Step. */
        interface IStep {

            /** Step id */
            id?: (string|null);

            /** Step title */
            title?: (string|null);

            /** Step desc */
            desc?: (string|null);

            /** Step role */
            role?: (string|null);

            /** Step when */
            when?: (string|null);

            /** Step token */
            token?: (flowspec.v1.IToken|null);

            /** Step instructions */
            instructions?: (string[]|null);

            /** Step prompts */
            prompts?: (flowspec.v1.IPrompts|null);

            /** Step acceptance */
            acceptance?: (flowspec.v1.IAcceptance|null);

            /** Step emitEvents */
            emitEvents?: (string[]|null);

            /** Step metrics */
            metrics?: ({ [k: string]: string }|null);

            /** Step next */
            next?: (flowspec.v1.INextStep[]|null);

            /** Step timeoutMs */
            timeoutMs?: (number|null);

            /** Step maxAttempts */
            maxAttempts?: (number|null);
        }

        /** Represents a Step. */
        class Step implements IStep {

            /**
             * Constructs a new Step.
             * @param [properties] Properties to set
             */
            constructor(properties?: flowspec.v1.IStep);

            /** Step id. */
            public id: string;

            /** Step title. */
            public title: string;

            /** Step desc. */
            public desc: string;

            /** Step role. */
            public role: string;

            /** Step when. */
            public when: string;

            /** Step token. */
            public token?: (flowspec.v1.IToken|null);

            /** Step instructions. */
            public instructions: string[];

            /** Step prompts. */
            public prompts?: (flowspec.v1.IPrompts|null);

            /** Step acceptance. */
            public acceptance?: (flowspec.v1.IAcceptance|null);

            /** Step emitEvents. */
            public emitEvents: string[];

            /** Step metrics. */
            public metrics: { [k: string]: string };

            /** Step next. */
            public next: flowspec.v1.INextStep[];

            /** Step timeoutMs. */
            public timeoutMs: number;

            /** Step maxAttempts. */
            public maxAttempts: number;

            /**
             * Encodes the specified Step message. Does not implicitly {@link flowspec.v1.Step.verify|verify} messages.
             * @param message Step message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: flowspec.v1.IStep, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a Step message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns Step
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): flowspec.v1.Step;

            /**
             * Gets the default type url for Step
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** Properties of a Token. */
        interface IToken {

            /** Token advisory */
            advisory?: (boolean|null);

            /** Token scope */
            scope?: (flowspec.v1.ITokenScope|null);

            /** Token claims */
            claims?: (flowspec.v1.ITokenClaims|null);
        }

        /** Represents a Token. */
        class Token implements IToken {

            /**
             * Constructs a new Token.
             * @param [properties] Properties to set
             */
            constructor(properties?: flowspec.v1.IToken);

            /** Token advisory. */
            public advisory: boolean;

            /** Token scope. */
            public scope?: (flowspec.v1.ITokenScope|null);

            /** Token claims. */
            public claims?: (flowspec.v1.ITokenClaims|null);

            /**
             * Encodes the specified Token message. Does not implicitly {@link flowspec.v1.Token.verify|verify} messages.
             * @param message Token message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: flowspec.v1.IToken, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a Token message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns Token
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): flowspec.v1.Token;

            /**
             * Gets the default type url for Token
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** Properties of a TokenScope. */
        interface ITokenScope {

            /** TokenScope fsRead */
            fsRead?: (string[]|null);

            /** TokenScope fsWrite */
            fsWrite?: (string[]|null);

            /** TokenScope net */
            net?: (string|null);

            /** TokenScope exec */
            exec?: (string[]|null);

            /** TokenScope secrets */
            secrets?: (string[]|null);

            /** TokenScope leaseMs */
            leaseMs?: (number|null);
        }

        /** Represents a TokenScope. */
        class TokenScope implements ITokenScope {

            /**
             * Constructs a new TokenScope.
             * @param [properties] Properties to set
             */
            constructor(properties?: flowspec.v1.ITokenScope);

            /** TokenScope fsRead. */
            public fsRead: string[];

            /** TokenScope fsWrite. */
            public fsWrite: string[];

            /** TokenScope net. */
            public net: string;

            /** TokenScope exec. */
            public exec: string[];

            /** TokenScope secrets. */
            public secrets: string[];

            /** TokenScope leaseMs. */
            public leaseMs: number;

            /**
             * Encodes the specified TokenScope message. Does not implicitly {@link flowspec.v1.TokenScope.verify|verify} messages.
             * @param message TokenScope message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: flowspec.v1.ITokenScope, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a TokenScope message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns TokenScope
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): flowspec.v1.TokenScope;

            /**
             * Gets the default type url for TokenScope
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** Properties of a TokenClaims. */
        interface ITokenClaims {

            /** TokenClaims aud */
            aud?: (string|null);

            /** TokenClaims sub */
            sub?: (string|null);

            /** TokenClaims nonce */
            nonce?: (string|null);
        }

        /** Represents a TokenClaims. */
        class TokenClaims implements ITokenClaims {

            /**
             * Constructs a new TokenClaims.
             * @param [properties] Properties to set
             */
            constructor(properties?: flowspec.v1.ITokenClaims);

            /** TokenClaims aud. */
            public aud: string;

            /** TokenClaims sub. */
            public sub: string;

            /** TokenClaims nonce. */
            public nonce: string;

            /**
             * Encodes the specified TokenClaims message. Does not implicitly {@link flowspec.v1.TokenClaims.verify|verify} messages.
             * @param message TokenClaims message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: flowspec.v1.ITokenClaims, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a TokenClaims message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns TokenClaims
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): flowspec.v1.TokenClaims;

            /**
             * Gets the default type url for TokenClaims
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** Properties of a Prompts. */
        interface IPrompts {

            /** Prompts system */
            system?: (string|null);

            /** Prompts user */
            user?: (string|null);

            /** Prompts notes */
            notes?: (string|null);
        }

        /** Represents a Prompts. */
        class Prompts implements IPrompts {

            /**
             * Constructs a new Prompts.
             * @param [properties] Properties to set
             */
            constructor(properties?: flowspec.v1.IPrompts);

            /** Prompts system. */
            public system: string;

            /** Prompts user. */
            public user: string;

            /** Prompts notes. */
            public notes: string;

            /**
             * Encodes the specified Prompts message. Does not implicitly {@link flowspec.v1.Prompts.verify|verify} messages.
             * @param message Prompts message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: flowspec.v1.IPrompts, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a Prompts message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns Prompts
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): flowspec.v1.Prompts;

            /**
             * Gets the default type url for Prompts
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** Properties of an Acceptance. */
        interface IAcceptance {

            /** Acceptance checks */
            checks?: (flowspec.v1.ICheck[]|null);
        }

        /** Represents an Acceptance. */
        class Acceptance implements IAcceptance {

            /**
             * Constructs a new Acceptance.
             * @param [properties] Properties to set
             */
            constructor(properties?: flowspec.v1.IAcceptance);

            /** Acceptance checks. */
            public checks: flowspec.v1.ICheck[];

            /**
             * Encodes the specified Acceptance message. Does not implicitly {@link flowspec.v1.Acceptance.verify|verify} messages.
             * @param message Acceptance message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: flowspec.v1.IAcceptance, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes an Acceptance message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns Acceptance
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): flowspec.v1.Acceptance;

            /**
             * Gets the default type url for Acceptance
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** Properties of a Check. */
        interface ICheck {

            /** Check kind */
            kind?: (string|null);

            /** Check path */
            path?: (string|null);

            /** Check file */
            file?: (string|null);

            /** Check keys */
            keys?: (string[]|null);

            /** Check allowed */
            allowed?: (string[]|null);

            /** Check min */
            min?: (number|null);

            /** Check expr */
            expr?: (string|null);

            /** Check schema */
            schema?: (string|null);

            /** Check onFail */
            onFail?: (string|null);

            /** Check severity */
            severity?: (string|null);
        }

        /** Represents a Check. */
        class Check implements ICheck {

            /**
             * Constructs a new Check.
             * @param [properties] Properties to set
             */
            constructor(properties?: flowspec.v1.ICheck);

            /** Check kind. */
            public kind: string;

            /** Check path. */
            public path: string;

            /** Check file. */
            public file: string;

            /** Check keys. */
            public keys: string[];

            /** Check allowed. */
            public allowed: string[];

            /** Check min. */
            public min: number;

            /** Check expr. */
            public expr: string;

            /** Check schema. */
            public schema: string;

            /** Check onFail. */
            public onFail: string;

            /** Check severity. */
            public severity: string;

            /**
             * Encodes the specified Check message. Does not implicitly {@link flowspec.v1.Check.verify|verify} messages.
             * @param message Check message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: flowspec.v1.ICheck, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a Check message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns Check
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): flowspec.v1.Check;

            /**
             * Gets the default type url for Check
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** Properties of a NextStep. */
        interface INextStep {

            /** NextStep to */
            to?: (string|null);

            /** NextStep when */
            when?: (string|null);
        }

        /** Represents a NextStep. */
        class NextStep implements INextStep {

            /**
             * Constructs a new NextStep.
             * @param [properties] Properties to set
             */
            constructor(properties?: flowspec.v1.INextStep);

            /** NextStep to. */
            public to: string;

            /** NextStep when. */
            public when: string;

            /**
             * Encodes the specified NextStep message. Does not implicitly {@link flowspec.v1.NextStep.verify|verify} messages.
             * @param message NextStep message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: flowspec.v1.INextStep, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a NextStep message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns NextStep
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): flowspec.v1.NextStep;

            /**
             * Gets the default type url for NextStep
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }
    }
}
