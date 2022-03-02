﻿using Microsoft.AspNetCore.WebUtilities;
using Microsoft.Net.Http.Headers;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.PixelFormats;

namespace WebApi.Endpoints.Codec.Request;

public class DecodeRequest : MiniApi.Request
{
    public Image<Rgb24> CoverImage { get; set; } = null!;

    public string Key { get; set; } = null!;

    public override async Task BindAsync(HttpContext context, List<string> validationErrors)
    {
        if (!IsMultipartContentType(context))
        {
            validationErrors.Add("Content-Type must be multipart/form-data");
            return;
        }

        string boundary = GetBoundary(context);
        MultipartReader multipartReader = new(boundary, context.Request.Body);
        MultipartSection? section = await multipartReader.ReadNextSectionAsync();

        if (section == null)
        {
            validationErrors.Add("Request is empty");
            return;
        }

        bool hasContentDispositionHeader =
            ContentDispositionHeaderValue.TryParse(
                section.ContentDisposition,
                out ContentDispositionHeaderValue? contentDisposition);

        if (!hasContentDispositionHeader || contentDisposition == null ||
            !HasFileContentDisposition(contentDisposition) ||
            contentDisposition.Name != "coverImage")
        {
            validationErrors.Add("Request must contain a cover image");
            return;
        }

        section.Body.Position = 0;

        CoverImage = await Image.LoadAsync<Rgb24>(section.Body);

        section = await multipartReader.ReadNextSectionAsync();

        if (section == null)
        {
            validationErrors.Add("Request must contain a key");
            return;
        }

        hasContentDispositionHeader =
            ContentDispositionHeaderValue.TryParse(section.ContentDisposition, out contentDisposition);

        if (!hasContentDispositionHeader || contentDisposition == null ||
            !HasFormDataContentDisposition(contentDisposition) ||
            contentDisposition.Name != "key")
        {
            validationErrors.Add("Request must contain a key");
            return;
        }

        using StreamReader reader = new(section.Body);
        Key = await reader.ReadToEndAsync();
    }
}
