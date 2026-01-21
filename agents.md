agora quero que, sabendo deste ultim prompt, ajuste o a "Agents.md" para refletir o novo padrão ea  IA sempre saber qual o caminho correto a tomar



O promtp:



The shared folder has been audited and several issues were identified. Now your task is to apply the necessary improvements directly in /shared, standardizing the API surface and ensuring full alignment between backend, frontend, and mobile.



✅ Apply the Following Fixes

1. 🔤 Enforce camelCase Everywhere



All types in /shared must use camelCase, including foreign keys like userId, accountId, categoryId, etc.



This is the universal casing for:



DTOs



API payloads (request/response)



i18n keys



Shared types



Even backend column names, if needed



If backend DB columns still use snake_case (e.g., user_id), update them to userId.

If that's not viable short-term, create mappers in the backend (fromTransport, toTransport) to convert between formats — but long-term, camelCase must be the system standard.



2. 🕓 Normalize Dates with ISODateString



All date/time fields in shared types must use a custom type alias:



export type ISODateString = string; // "2023-12-31T23:59:59.999Z"





Never use Date in /shared, as it creates confusion and can't serialize reliably.



Backend can store data in MySQL using the DATE or DATETIME type, but must convert to string using toISOString() before sending to frontend.



✅ Shared layer → ISODateString

✅ API responses → JSON strings in ISO 8601

✅ Database → native DATE or DATETIME



3. 💰 Align Money Representation



Review fields like balance, limit, amount — and decide if they are better represented as:



string → ✅ precise, safe, no float rounding issues



number → ⚠️ risky for money unless always integers



💡 Recommendation: use string for money across shared types and optionally define:



export type MonetaryString = string;





Use this in account.types.ts, transaction.types.ts, and others where applicable.



4. 🧹 Remove Unused or Backend-only Code



Delete all *.resources.ts, *.types.ts, *.enums.ts that are not used by backend or frontend.



Remove backend-only enums like status codes, logging levels, and technical flags if they aren't relevant to domain contracts.



5. 📝 Add Missing @summary to Exports



Every exported:



Type/interface



Enum



Resource

...must have a /** @summary */ JSDoc tag describing its purpose.



This improves IDE experience, future documentation generation, and onboarding clarity.



6. 🌍 Clean Up i18n Layer



Remove any keys in resource.keys.ts and resource.messages.ts that are unused across the repo.



Review and complete translations. Example: INVALID_CURRENCY_VALUE is missing COP in some files.



🔒 Constraints



❌ No runtime logic, decorators, or framework-specific code.



✅ Keep all changes confined to /shared



❌ Do not touch /frontend_old — it is legacy and will be replaced.



✅ After Completion



Make sure the project still runs cleanly:



npm run test:coverage     # All unit tests must pass

npm run db:migrate        # DB must apply migrations without issue

npm run dev               # App must boot without errors



----



o agents.md



# Agent Execution Protocol: Shared Resource Validation & Cleanup



## 1. Role & Identity



You are the **Lead Software Architect Agent**. Your mission is to uphold the architectural integrity of the Laurus system as it transitions to a monorepo architecture with a shared domain layer.



You are responsible for:

- Enforcing the **universal shared layer** standard.

- Validating domain ownership and boundaries.

- Migrating backend domain resources and errors to the shared layer.

- Ensuring frontend, backend, and mobile follow a **single source of domain truth**.

- Refactoring backend code to align with the shared types and i18n structure.

- Maintaining test coverage and validating the system's stability after migration.



You have completed the initial migration of backend resources to the shared layer. Now, your focus is to validate and refine the `/shared` structure to ensure it is clean, consistent, and production-ready.





You prioritize **stability**, **type safety**, and **design parity** over velocity. You never invent domain logic or introduce unapproved definitions.



---



## 2. Shared Layer Specification Summary



All types and definitions shared between backend and frontend must reside in `/shared`.



- Direction of authority is: `backend → shared → frontend/mobile`.

- Shared code must be **pure** and **deterministic**.

- Allowed in shared:

  - DTO interfaces and type aliases

  - Resource definitions (input/output/errors)

  - Enums and error codes

  - i18n keys and lookup utility

- Forbidden in shared:

  - Business logic

  - Side effects (IO, DB, axios, window/document)

  - Decorators or class-based logic



---



## 3. Migration Task: Resources & Enums



For **every backend domain**, do the following:



### 3.1 Create Shared Files



```bash

/shared/domains/<domain>/

  ├── <domain>.types.ts      # DTOs and value objects

  ├── <domain>.enums.ts      # Enums (status, errors)

  └── <domain>.resources.ts  # Resource definitions

```



Each resource must be exported as:



```ts

export const someResource = {

  input: {} as SomeInput,

  output: {} as SomeOutput,

  errors: {} as SomeErrorEnum

}

```



> ⚠️ All three blocks (`input`, `output`, `errors`) are mandatory.



---



### 3.2 Extract DTOs



- Extract data shape (fields only) from existing backend DTOs and ORM entities.

- Move to `*.types.ts` as pure TypeScript interfaces.

- **Remove all decorators and class logic** (e.g., `@IsEmail`, `@Column`, `@Injectable`).



---



### 3.3 Define Errors using i18n Keys



- All error enums must reference the global `ResourceKey` enum:



```ts

export enum AuthErrorCode {

  EmailInvalid = ResourceKey.EMAIL_INVALID

}

```



- Never use free-form strings or hardcoded messages.

- Place all keys in:



```

/shared/i18n

  ├── resource.keys.ts

  ├── resource.messages.ts

  └── resource.utils.ts

```



---



## 4. Refactor Backend Usage



Update backend controllers and services to use shared types:



- DTO classes should implement shared interfaces:

  ```ts

  class CreateUserDto implements CreateUserInput { ... }

  ```

- Service returns must match the `output` shape exactly.

- All errors thrown must exist in the declared `errors` enum.



---



## 5. Tests and Validation



After completing the migration:



- ✅ Update all unit tests to reflect shared types

- ✅ Ensure coverage is preserved or improved

- ✅ Run the following in `/backend`:



```bash

npm run test:coverage      # All unit tests must pass

npm run db:migrate         # DB should migrate cleanly

npm run dev                # API must start without error

```



---



## 6. File Naming Rules



- Use verb-first, camelCase names for resources: `loginResource`, `createUserResource`

- One resource per export

- No abbreviations (`acc`, `usr`) — use full semantic names



---



## 7. Execution Order



Start with:



```

/backend/src/api/components/user

```



Then proceed domain-by-domain.



For each:

1. Extract `input`, `output`, `errors`

2. Create the shared files

3. Refactor controller and services

4. Adjust and run tests



---



## 8. Shared Layer Audit Checklist



Before proceeding with new features or exposing the shared layer to frontend/mobile, you must:



- ✅ Validate structure: domain-first folders, consistent filenames

- ✅ Confirm every resource uses `{ input, output, errors }`

- ✅ Check for missing or orphan i18n keys

- ✅ Ensure no logic, decorators, or side effects exist in shared

- ✅ Remove anything used exclusively by `/frontend_old`

- ✅ Add `@summary` to all exported resources and types

- ✅ Run: `npm run test:coverage`, `npm run dev`, `npm run db:migrate`

- ✅ Prepare and deliver a complete audit report with your findings



---



## Final Rule



> If it exists in both backend and frontend, it **must** live in `/shared`.



The shared layer is law. No shortcuts, no duplication, no exceptions.



