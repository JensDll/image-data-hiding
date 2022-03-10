﻿using Domain.Entities;
using NUnit.Framework;

namespace Domain.UnitTests.Entities;

[TestFixture]
internal class KeyGeneratorTests
{
    [TestCase(4, 4)]
    [TestCase(8, 8)]
    [TestCase(16, 16)]
    [TestCase(32, 32)]
    [TestCase(64, 64)]
    [TestCase(128, 128)]
    [TestCase(256, 256)]
    [TestCase(512, 512)]
    // Should round to multiple of four
    [TestCase(6, 4)]
    [TestCase(13, 12)]
    [TestCase(21, 20)]
    public void GenerateKey_ShouldGenerateKeyOfGivenLength(int length, int expectedLength)
    {
        //Arrange
        KeyGenerator generator = new();

        // Act
        string key = generator.GenerateKey(length);

        // Assert
        Assert.That(key, Has.Length.EqualTo(expectedLength));
    }

    [Test]
    public void GenerateKey_ShouldBeUnique()
    {
        // Arrange
        KeyGenerator generator = new();

        // Act
        string key1 = generator.GenerateKey(256);
        string key2 = generator.GenerateKey(256);

        // Assert
        Assert.That(key1, Is.Not.EqualTo(key2));
    }

    [TestCase(128, (ushort) 10, 42)]
    [TestCase(256, (ushort) 20, 100)]
    [TestCase(512, (ushort) 30, 100_000)]
    public void TryParseKey_ShouldParseKeyComponents(int inKeyLength, ushort inSeed, int inMessageLength)
    {
        // Arrange
        KeyGenerator generator = new();
        string inKey = generator.GenerateKey(inKeyLength);
        inKey = generator.AddMetaData(inKey, inSeed, inMessageLength);

        // Act
        bool success = generator.TryParseKey(inKey, out ushort outSeed, out int outMessageLength, out string outKey);

        // Assert
        Assert.That(success, Is.True);
        Assert.That(inSeed, Is.EqualTo(outSeed));
        Assert.That(inMessageLength, Is.EqualTo(outMessageLength));
        Assert.That(inKeyLength, Is.EqualTo(outKey.Length));
        Assert.That(outKey, Is.EqualTo(inKey[8..]));
    }

    [Test]
    public void TryParseKey_ShouldFailForInvalidKey()
    {
        // Arrange
        KeyGenerator generator = new();

        // Act
        bool success = generator.TryParseKey("abc", out ushort _, out int _, out string _);

        // Assert
        Assert.That(success, Is.False);
    }
}
