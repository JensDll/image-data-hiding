using System.Reflection;
using Microsoft.AspNetCore.Http;

namespace ApiBuilder;

internal static class RequestTypeCache<TRequest>
{
    static RequestTypeCache()
    {
        Type tRequest = typeof(TRequest);

        MethodInfo? bindAsync = tRequest.GetMethod("BindAsync");
        if (bindAsync is not null)
        {
            BindAsync =
                (Func<TRequest, HttpContext, List<string>, CancellationToken, ValueTask>) Delegate.CreateDelegate(
                    typeof(Func<TRequest, HttpContext, List<string>, CancellationToken, ValueTask>), bindAsync);
        }

        MethodInfo? dispose = tRequest.GetMethod("Dispose");
        if (dispose is not null)
        {
            Dispose = (Action<TRequest>) Delegate.CreateDelegate(typeof(Action<TRequest>), dispose);
        }
    }

    internal static Func<TRequest, HttpContext, List<string>, CancellationToken, ValueTask>? BindAsync { get; }

    internal static Action<TRequest>? Dispose { get; }
}
