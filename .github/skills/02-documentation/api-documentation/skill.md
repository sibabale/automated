---
name: api-documentation
description: Standards for documenting public APIs consistently.
---

# API Documentation Standard

## Purpose

Apply this skill whenever creating or modifying public APIs.

API documentation should allow consumers to integrate without reading implementation code.

---

## Before Starting

Verify the following:

- [ ] Public endpoints have been identified.
- [ ] API contracts are understood.
- [ ] Authentication requirements are known.

---

## Before Finishing

Verify the following:

### Endpoint Information

- [ ] Endpoint purpose is documented.
- [ ] HTTP method is documented.
- [ ] Route is documented.
- [ ] API version is documented.

### Requests

- [ ] Request parameters are documented.
- [ ] Path parameters are documented.
- [ ] Query parameters are documented.
- [ ] Request body is documented.
- [ ] Validation rules are documented.

### Responses

- [ ] Success responses are documented.
- [ ] Error responses are documented.
- [ ] Response models are documented.
- [ ] Status codes are documented.

### Security

- [ ] Authentication requirements are documented.
- [ ] Authorization requirements are documented.

### Examples

- [ ] Request examples are included.
- [ ] Response examples are included.
- [ ] Error examples are included.

### Versioning

- [ ] Breaking changes are documented.
- [ ] Deprecated endpoints are identified.

---

## Documentation Discovery

Before making any documentation changes, inspect the repository to determine how API documentation is maintained.

Look for the following, in order of preference:

### OpenAPI / Swagger

Check for:

- Microsoft.AspNetCore.OpenApi
- Swashbuckle.AspNetCore
- NSwag
- OpenAPI configuration in Program.cs
- OpenAPI attributes or annotations

If present:

- Update the generated OpenAPI documentation.
- Ensure new endpoints appear in the generated specification.
- Update summaries and descriptions where appropriate.

---

### XML Documentation

Check for:

- XML documentation generation enabled in the project (.csproj)
- XML comments on Controllers
- XML comments on Minimal API endpoints
- XML comments on request/response models
- XML comments on public DTOs

If present:

- Add or update XML documentation for new or modified public APIs.

---

### Markdown Documentation

Check for:

- docs/api/
- docs/apis/
- docs/
- api.md
- README.md API sections

If present:

- Update the relevant Markdown documentation.

---

### If No Documentation Exists

If no API documentation mechanism exists:

- Recommend introducing OpenAPI generation for ASP.NET Core APIs.
- Do not create a new documentation system unless explicitly requested.

## Common Mistakes

Avoid:

- Undocumented parameters.
- Missing error responses.
- Missing authentication requirements.
- Examples that no longer work.
- Documentation that differs from implementation.

---

## Definition of Done

- [ ] Every public endpoint is documented.
- [ ] Documentation matches implementation.
- [ ] Consumers can successfully integrate using the documentation alone.