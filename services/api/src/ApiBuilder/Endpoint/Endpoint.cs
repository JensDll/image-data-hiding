﻿using FluentValidation;
using FluentValidation.Results;
using Microsoft.AspNetCore.Http;

namespace ApiBuilder;

public abstract partial class Endpoint<TRequest, TResponse> : EndpointBase
    where TRequest : notnull, new()
    where TResponse : notnull, new()
{
    internal sealed override async Task ExecuteAsync(HttpContext context, CancellationToken cancellationToken)
    {
        HttpContext = context;
        ValidationErrors = new List<string>();

        TRequest? request = default;

        if (HttpContext.Request.HasJsonContentType())
        {
            request = await HttpContext.Request.ReadFromJsonAsync<TRequest>(cancellationToken);
        }

        request ??= new TRequest();

        if (RequestTypeCache<TRequest>.BindAsync != null)
        {
            try
            {
                await (ValueTask) RequestTypeCache<TRequest>.BindAsync.Invoke(request,
                    new object[] {HttpContext, ValidationErrors, cancellationToken})!;
            }
            catch (ModelBindingException e)
            {
                ValidationErrors.Add(e.Message);
            }
        }

        if (ValidationErrors.Any())
        {
            await SendValidationErrorAsync("Model binding failed");
            return;
        }

        bool isValid = await ValidateAsync(request);

        if (isValid)
        {
            await HandleAsync(request, cancellationToken);
        }
    }

    protected abstract Task HandleAsync(TRequest request, CancellationToken cancellationToken);

    private async Task<bool> ValidateAsync(TRequest request)
    {
        IValidator? validator = (IValidator?) HttpContext.RequestServices.GetService(typeof(IValidator<TRequest>));

        if (validator == null)
        {
            return true;
        }

        ValidationContext<object> validationContext = new(request);
        ValidationResult validationResult = await validator.ValidateAsync(validationContext);

        if (validationResult.IsValid)
        {
            return true;
        }

        foreach (ValidationFailure error in validationResult.Errors)
        {
            ValidationErrors.Add(error.ErrorMessage);
        }

        await SendValidationErrorAsync("Validation failed");

        return false;
    }
}

public abstract class EndpointWithoutRequest<TResponse> : Endpoint<EmptyRequest, TResponse>
    where TResponse : notnull, new()
{
    protected sealed override Task HandleAsync(EmptyRequest emptyRequest, CancellationToken cancellationToken)
    {
        return HandleAsync(cancellationToken);
    }

    protected abstract Task HandleAsync(CancellationToken cancellationToken);
}

public abstract class EndpointWithoutResponse<TRequest> : Endpoint<TRequest, object>
    where TRequest : notnull, new()
{
}

public abstract class EmptyEndpoint : EndpointWithoutRequest<object>
{
}
